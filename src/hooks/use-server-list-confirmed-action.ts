import { useCallback } from 'react'

import { Confirmation } from '@/components/ui/confirmation'
import { Toast } from '@/components/ui/toast'
import { getApiFailureMessage } from '@/utils/api-error'

export type ConfirmedActionParams = {
  title: string
  message: string
  confirmText: string
  successText: string
  errorText: string
  action: () => Promise<unknown>
  type?: 'info' | 'error'
}

/**
 * Shared pattern for a confirm-then-act row action on a list (approve/cancel/delete an order, ...):
 * open a confirm dialog → run the action → toast the result → call `onSuccess` (if given).
 *
 * There is no need for `onSuccess: paging.resetPaging` — a mutation should instead patch the RTK
 * Query cache directly via `onQueryStarted` + `api.util.updateQueryData` (with
 * `selectCachedArgsForQuery` to patch every cached page, not just the active one), so every list
 * page shows the mutation's effect immediately regardless of which page is on screen, without
 * depending on a refetch happening to target the right page. `onSuccess` is still exposed for a
 * feature that needs an extra side effect after a successful action beyond that cache patch.
 */
export function useServerListConfirmedAction(onSuccess?: () => void) {
  return useCallback(
    async ({
      title,
      message,
      confirmText,
      successText,
      errorText,
      action,
      type,
    }: ConfirmedActionParams) => {
      const confirmed = await Confirmation.confirm({ title, message, confirmText, type })
      if (!confirmed) {
        return
      }
      try {
        await action()
        onSuccess?.()
        Toast.show({ text: successText, type: 'success' })
      } catch (error) {
        Toast.show({ text: getApiFailureMessage(error, errorText), type: 'error' })
      }
    },
    [onSuccess],
  )
}
