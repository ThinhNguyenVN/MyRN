import { Confirmation } from '@/components/ui/confirmation'
import { i18n } from '@/i18n'

import { syncBrowserLeaveGuard } from './unsaved-changes-browser'

type GuardEntry = {
  /** Dirty and not yet allowed to leave. */
  isActive: () => boolean
  /** Lets the next leave through without asking (after save, or after the user discarded). */
  release: () => void
}

const entries = new Map<number, GuardEntry>()
let nextId = 0
let pendingConfirm: Promise<boolean> | null = null

function isDirty(): boolean {
  for (const entry of entries.values()) {
    if (entry.isActive()) return true
  }
  return false
}

function releaseAll() {
  for (const entry of entries.values()) {
    if (entry.isActive()) entry.release()
  }
}

/** Shared "Stay / Discard" dialog; concurrent callers share one dialog. */
function confirmDiscard(): Promise<boolean> {
  pendingConfirm ??= Confirmation.confirm({
    title: i18n.t('common.unsavedChanges.title'),
    message: i18n.t('common.unsavedChanges.message'),
    confirmText: i18n.t('common.unsavedChanges.confirm'),
    cancelText: i18n.t('common.unsavedChanges.cancel'),
    type: 'error',
  })
    .catch(() => false)
    .finally(() => {
      pendingConfirm = null
    })
  return pendingConfirm
}

/** Asks once for every dirty form; on "Discard" releases them all. */
async function confirmLeave(): Promise<boolean> {
  if (!isDirty()) return true
  const confirmed = await confirmDiscard()
  if (confirmed) releaseAll()
  return confirmed
}

/** Re-evaluates the browser-level guard (web: `beforeunload` + back/forward). */
function refresh() {
  syncBrowserLeaveGuard(isDirty(), confirmLeave)
}

function register(entry: GuardEntry): () => void {
  const id = nextId++
  entries.set(id, entry)
  refresh()
  return () => {
    entries.delete(id)
    refresh()
  }
}

/**
 * App-wide record of forms with unsaved changes. Forms join through `useUnsavedChangesGuard`.
 * - `confirmLeave()`: lateral navigation (sidebar, drawer, bell, shortcuts) awaits it before
 *   `router.push`, since a push keeps the form mounted and no `beforeRemove` fires.
 * - `allowLeave()`: call right before navigating away after a successful save/delete, while the
 *   form is still dirty. Guards turn back on when their screen is focused again.
 */
export const unsavedChanges = {
  register,
  refresh,
  isDirty,
  confirmLeave,
  confirmDiscard,
  allowLeave: releaseAll,
}
