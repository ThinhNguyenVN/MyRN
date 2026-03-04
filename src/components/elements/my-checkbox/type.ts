import type { ReactNode } from 'react'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'

import type { ElevationToken } from '@/theme/elevation'

export type MyCheckboxType = 'checkbox' | 'radio'

export interface MyCheckboxProps {
  type?: MyCheckboxType
  checked?: boolean
  onValueChange?: (value: boolean) => void
  disabled?: boolean

  elevation?: ElevationToken | 'none'
  label?: ReactNode

  isLeftLabel?: boolean
  labelStyle?: StyleProp<TextStyle>
  style?: StyleProp<ViewStyle>
}
