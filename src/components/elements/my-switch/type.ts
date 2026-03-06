import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'

export interface MySwitchProps {
  value?: boolean
  onValueChange?: (value: boolean) => void
  disabled?: boolean
  label?: ReactNode
  isLeftLabel?: boolean
  labelStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
}
