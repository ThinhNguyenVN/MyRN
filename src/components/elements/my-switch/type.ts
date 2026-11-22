import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'

export interface MySwitchProps {
  value?: boolean
  onValueChange?: (value: boolean) => void
  disabled?: boolean
  label?: ReactNode
  /** Accessible name; falls back to nothing (role=switch + checked state are always set). */
  accessibilityLabel?: string
  isLeftLabel?: boolean
  /** Label above the track — use in tight footers on mobile. */
  stacked?: boolean
  labelStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
}
