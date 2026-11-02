import { Confirmation } from '@/components/ui/confirmation'

import { syncBrowserLeaveGuard } from './unsaved-changes-browser'
import { unsavedChanges } from './unsaved-changes-registry'

jest.mock('@/components/ui/confirmation', () => ({ Confirmation: { confirm: jest.fn() } }))
jest.mock('@/i18n', () => ({ i18n: { t: (key: string) => key } }))
jest.mock('./unsaved-changes-browser', () => ({ syncBrowserLeaveGuard: jest.fn() }))

const confirmMock = Confirmation.confirm as jest.Mock
const syncMock = syncBrowserLeaveGuard as jest.Mock

function makeEntry(dirty: boolean) {
  const state = { dirty, released: false }
  const entry = {
    isActive: () => state.dirty && !state.released,
    release: jest.fn(() => {
      state.released = true
    }),
  }
  return { state, entry, unregister: unsavedChanges.register(entry) }
}

describe('unsavedChanges registry', () => {
  const cleanups: (() => void)[] = []
  const track = (dirty: boolean) => {
    const made = makeEntry(dirty)
    cleanups.push(made.unregister)
    return made
  }

  beforeEach(() => {
    confirmMock.mockReset()
    syncMock.mockReset()
  })
  afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup())
  })

  it('leaves without asking when no form is dirty', async () => {
    track(false)
    await expect(unsavedChanges.confirmLeave()).resolves.toBe(true)
    expect(confirmMock).not.toHaveBeenCalled()
  })

  it('asks once and releases every dirty form on "Discard"', async () => {
    const a = track(true)
    const b = track(true)
    const clean = track(false)
    confirmMock.mockResolvedValue(true)

    await expect(unsavedChanges.confirmLeave()).resolves.toBe(true)

    expect(confirmMock).toHaveBeenCalledTimes(1)
    expect(confirmMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'common.unsavedChanges.title',
        confirmText: 'common.unsavedChanges.confirm',
        cancelText: 'common.unsavedChanges.cancel',
      }),
    )
    expect(a.entry.release).toHaveBeenCalled()
    expect(b.entry.release).toHaveBeenCalled()
    expect(clean.entry.release).not.toHaveBeenCalled()
    expect(unsavedChanges.isDirty()).toBe(false)
  })

  it('stays when the user picks "Stay"', async () => {
    const a = track(true)
    confirmMock.mockResolvedValue(false)

    await expect(unsavedChanges.confirmLeave()).resolves.toBe(false)
    expect(a.entry.release).not.toHaveBeenCalled()
    expect(unsavedChanges.isDirty()).toBe(true)
  })

  it('shares one dialog between concurrent callers', async () => {
    track(true)
    let resolve: (value: boolean) => void = () => undefined
    confirmMock.mockReturnValue(new Promise<boolean>((r) => (resolve = r)))

    const first = unsavedChanges.confirmLeave()
    const second = unsavedChanges.confirmLeave()
    resolve(false)

    await expect(Promise.all([first, second])).resolves.toEqual([false, false])
    expect(confirmMock).toHaveBeenCalledTimes(1)
  })

  it('treats a dialog failure as "Stay"', async () => {
    track(true)
    confirmMock.mockRejectedValue(new Error('not mounted'))
    await expect(unsavedChanges.confirmLeave()).resolves.toBe(false)
  })

  it('allowLeave releases dirty forms without a dialog', () => {
    const a = track(true)
    unsavedChanges.allowLeave()
    expect(a.entry.release).toHaveBeenCalled()
    expect(confirmMock).not.toHaveBeenCalled()
  })

  it('syncs the browser guard with the dirty state', () => {
    const a = track(true)
    expect(syncMock).toHaveBeenLastCalledWith(true, unsavedChanges.confirmLeave)
    a.state.dirty = false
    unsavedChanges.refresh()
    expect(syncMock).toHaveBeenLastCalledWith(false, unsavedChanges.confirmLeave)
  })
})
