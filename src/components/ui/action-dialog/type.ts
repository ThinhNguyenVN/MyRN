import type { ReactNode } from 'react'

/** Shell of a write dialog: title, body, inline error, cancel + submit. */
export type ActionDialogProps = {
  visible: boolean
  title: string
  submitText: string
  submitType?: 'primary' | 'secondary' | 'tertiary'
  submitDisabled?: boolean
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: () => void
  /** Optional secondary action (e.g. "Back" on a confirm step). */
  secondaryText?: string
  onSecondary?: () => void
  children: ReactNode
}
