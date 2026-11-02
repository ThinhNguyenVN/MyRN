import { memo } from 'react'
import { useFormState } from 'react-hook-form'

import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'

export type UnsavedChangesGuardProps = {
  /** Unsaved state kept outside react-hook-form (e.g. a picked image waiting for Save). */
  extraDirty?: boolean
}

/**
 * Drop inside `MyForm` to ask before leaving with unsaved changes. Before navigating away after a
 * successful save/delete, call `unsavedChanges.allowLeave()` (`@/hooks/unsaved-changes-registry`).
 */
function UnsavedChangesGuard({ extraDirty = false }: UnsavedChangesGuardProps) {
  const { isDirty } = useFormState()
  useUnsavedChangesGuard(isDirty || extraDirty)
  return null
}

export default memo(UnsavedChangesGuard)
