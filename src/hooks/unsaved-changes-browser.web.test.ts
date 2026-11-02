/**
 * Web leave guard against a fake `window` (Jest runs the RN preset, no jsdom). `window` runs
 * `popstate` listeners in registration order, so — like `index.ts` before `expo-router/entry` —
 * the guard is installed first and the "expo-router" listener after it.
 */
type SyncFn = (active: boolean, confirmLeave: () => Promise<boolean>) => void
type BrowserGuardModule = { syncBrowserLeaveGuard: SyncFn; installBrowserLeaveGuard: () => void }

type Entry = { id: string }

function createFakeWindow(entries: Entry[], startIndex: number) {
  const target = new EventTarget()
  const history = {
    entries,
    index: startIndex,
    get state(): Entry | undefined {
      return this.entries[this.index]
    },
    go: jest.fn((n: number) => {
      setTimeout(() => {
        history.index += n
        target.dispatchEvent(new Event('popstate'))
      }, 0)
    }),
  }
  const fakeWindow = {
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
    history,
    navigation: {
      get currentEntry() {
        return { index: history.index }
      },
    },
  }
  /** User presses back (-1) or forward (+1) in the browser. */
  const userMove = (n: number) => {
    history.index += n
    target.dispatchEvent(new Event('popstate'))
  }
  return { fakeWindow, history, userMove }
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 10))

describe('syncBrowserLeaveGuard (web)', () => {
  const realWindow = global.window
  let sync: SyncFn
  let fake: ReturnType<typeof createFakeWindow>
  let expoListener: jest.Mock

  function setup(entries: Entry[], startIndex: number) {
    fake = createFakeWindow(entries, startIndex)
    ;(global as unknown as { window: unknown }).window = fake.fakeWindow
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- fresh module state per test
      const guard = require('./unsaved-changes-browser.web') as BrowserGuardModule
      guard.installBrowserLeaveGuard()
      sync = guard.syncBrowserLeaveGuard
    })
    expoListener = jest.fn()
    fake.fakeWindow.addEventListener('popstate', expoListener)
  }

  afterEach(() => {
    sync(false, async () => true)
    ;(global as unknown as { window: unknown }).window = realWindow
  })

  it('lets back/forward through while no form is dirty', () => {
    setup([{ id: 'list' }, { id: 'form' }], 1)
    sync(false, jest.fn())

    fake.userMove(-1)
    expect(expoListener).toHaveBeenCalledTimes(1)
  })

  it('browser back: restores the form entry, asks, and stays on "Stay"', async () => {
    setup([{ id: 'list' }, { id: 'form' }], 1)
    const confirmLeave = jest.fn().mockResolvedValue(false)
    sync(true, confirmLeave)

    fake.userMove(-1)
    await settle()

    expect(fake.history.go).toHaveBeenCalledWith(1)
    expect(fake.history.index).toBe(1)
    expect(confirmLeave).toHaveBeenCalledTimes(1)
    expect(expoListener).not.toHaveBeenCalled()
  })

  it('browser back + "Discard": replays the back step for expo-router', async () => {
    setup([{ id: 'list' }, { id: 'form' }], 1)
    const confirmLeave = jest.fn(async () => {
      // The registry releases every guard before resolving.
      sync(false, confirmLeave)
      return true
    })
    sync(true, confirmLeave)

    fake.userMove(-1)
    await settle()
    await settle()

    expect(fake.history.go).toHaveBeenNthCalledWith(1, 1)
    expect(fake.history.go).toHaveBeenNthCalledWith(2, -1)
    expect(fake.history.index).toBe(0)
    expect(expoListener).toHaveBeenCalledTimes(1)
  })

  it('browser forward: steps back to the form entry before asking', async () => {
    setup([{ id: 'list' }, { id: 'form' }, { id: 'next' }], 1)
    const confirmLeave = jest.fn().mockResolvedValue(false)
    sync(true, confirmLeave)

    fake.userMove(1)
    await settle()

    expect(fake.history.go).toHaveBeenCalledWith(-1)
    expect(fake.history.index).toBe(1)
    expect(confirmLeave).toHaveBeenCalledTimes(1)
    expect(expoListener).not.toHaveBeenCalled()
  })

  it('does not ask twice when back is pressed again while the dialog is open', async () => {
    setup([{ id: 'list' }, { id: 'form' }], 1)
    const confirmLeave = jest.fn(() => new Promise<boolean>(() => undefined))
    sync(true, confirmLeave)

    fake.userMove(-1)
    await settle()
    fake.userMove(-1)
    await settle()

    expect(fake.history.index).toBe(1)
    expect(confirmLeave).toHaveBeenCalledTimes(1)
    expect(expoListener).not.toHaveBeenCalled()
  })

  it('coming back to the form from a screen it pushed is not leaving', () => {
    setup([{ id: 'list' }, { id: 'form' }], 1)
    const confirmLeave = jest.fn()
    sync(true, confirmLeave)
    fake.history.entries.push({ id: 'picker' })
    fake.history.index = 2

    fake.userMove(-1)
    expect(expoListener).toHaveBeenCalledTimes(1)
    expect(confirmLeave).not.toHaveBeenCalled()
  })

  it('blocks tab close / reload only while dirty', () => {
    setup([{ id: 'form' }], 0)
    sync(true, jest.fn())
    const dirtyEvent = new Event('beforeunload', { cancelable: true })
    fake.fakeWindow.dispatchEvent(dirtyEvent)
    expect(dirtyEvent.defaultPrevented).toBe(true)

    sync(false, jest.fn())
    const cleanEvent = new Event('beforeunload', { cancelable: true })
    fake.fakeWindow.dispatchEvent(cleanEvent)
    expect(cleanEvent.defaultPrevented).toBe(false)
  })
})
