import type { Ref } from 'react'

export type OtpCodeInputHandle = {
  focus: () => void
  /** Short horizontal shake (skipped when the OS asks for reduced motion). */
  shake: () => void
}

export type OtpCodeInputProps = {
  value: string
  /** Digits only, capped at `length`. */
  onChangeText: (code: string) => void
  /** Called once the value reaches `length` digits. */
  onComplete: (code: string) => void
  /** Number of digit cells. @default 6 */
  length?: number
  error?: boolean
  disabled?: boolean
  /** Focus the field on mount and whenever it is re-enabled. @default true */
  autoFocus?: boolean
  accessibilityLabel: string
  ref?: Ref<OtpCodeInputHandle>
}
