import type MyAlert from '@/components/elements/my-alert'
import type { MyAlertButtonProp } from '@/components/elements/my-alert'

export type ConfirmationOptions = Pick<
  React.ComponentProps<typeof MyAlert>,
  'title' | 'message' | 'description' | 'icon' | 'image' | 'type' | 'elevation' | 'style'
> & {
  confirmText?: string
  cancelText?: string
  buttons?: MyAlertButtonProp[]
  hideClose?: boolean
}

export interface ConfirmationRef {
  show: (options: ConfirmationOptions) => Promise<boolean>
  hide: () => void
}
