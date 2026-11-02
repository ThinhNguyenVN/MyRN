/**
 * Web leave guard while any form is dirty:
 * - `beforeunload`: tab close / reload shows the browser's own dialog.
 * - back/forward: expo-router applies a `popstate` with `resetRoot`, which skips `beforeRemove`.
 *   Our `popstate` listener swallows the event, steps the browser back to the form's entry, asks,
 *   and only on "Discard" replays the move for expo-router to handle.
 *
 * `window` runs `popstate` listeners in registration order (a capture flag does not put one first),
 * so `installBrowserLeaveGuard()` MUST run from `index.ts` before `expo-router/entry` registers
 * its own listener.
 *
 * The form's entry is identified by expo-router's `history.state.id`. The distance moved comes
 * from the Navigation API (`navigation.currentEntry.index`); without it a back step is assumed.
 */

type NavigationApi = { currentEntry?: { index: number } | null }

/** Give up restoring when the browser never answers (no entry to step to). */
const RESTORE_TIMEOUT_MS = 500

let active = false
let confirmLeaveFn: (() => Promise<boolean>) | null = null
let guardedId: unknown
let guardedIndex: number | null = null
let restoring = false
let asking = false
let leaveDelta = 0
let restoreTimer: ReturnType<typeof setTimeout> | null = null

function historyEntryId(): unknown {
  return (window.history.state as { id?: unknown } | null)?.id
}

function currentEntryIndex(): number | null {
  const index = (window as unknown as { navigation?: NavigationApi }).navigation?.currentEntry
    ?.index
  return typeof index === 'number' ? index : null
}

function clearRestoreTimer() {
  if (restoreTimer) {
    clearTimeout(restoreTimer)
    restoreTimer = null
  }
}

async function askToLeave() {
  if (!confirmLeaveFn) return
  asking = true
  const confirmed = await confirmLeaveFn()
  asking = false
  // `confirmLeave` released every guard, so this listener is detached and expo-router sees the
  // replayed move as a normal back/forward.
  if (confirmed) window.history.go(leaveDelta)
}

function onPopState(event: PopStateEvent) {
  if (!active) return
  const onGuardedEntry = historyEntryId() === guardedId

  if (restoring) {
    event.stopImmediatePropagation()
    if (onGuardedEntry) {
      restoring = false
      clearRestoreTimer()
      if (!asking) void askToLeave()
    }
    return
  }

  // Coming back to the form (e.g. from a screen it pushed) is not leaving it.
  if (onGuardedEntry) return

  event.stopImmediatePropagation()
  const index = currentEntryIndex()
  leaveDelta = index !== null && guardedIndex !== null ? index - guardedIndex : -1
  if (leaveDelta === 0) return
  restoring = true
  clearRestoreTimer()
  restoreTimer = setTimeout(() => {
    restoring = false
    restoreTimer = null
  }, RESTORE_TIMEOUT_MS)
  window.history.go(-leaveDelta)
}

function onBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault()
  // Legacy browsers only show the dialog when `returnValue` is set.
  event.returnValue = ''
}

let installed = false

/** Registers the `popstate` listener ahead of expo-router's; idle until a form is dirty. */
export function installBrowserLeaveGuard(): void {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('popstate', onPopState)
}

export function syncBrowserLeaveGuard(
  nextActive: boolean,
  confirmLeave: () => Promise<boolean>,
): void {
  if (typeof window === 'undefined') return
  confirmLeaveFn = confirmLeave
  if (nextActive === active) return
  active = nextActive

  if (active) {
    guardedId = historyEntryId()
    guardedIndex = currentEntryIndex()
    window.addEventListener('beforeunload', onBeforeUnload)
    return
  }

  window.removeEventListener('beforeunload', onBeforeUnload)
  restoring = false
  clearRestoreTimer()
}
