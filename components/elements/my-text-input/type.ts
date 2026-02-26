import type { ReactNode } from 'react'
import type { TextInputProps, StyleProp, TextStyle } from 'react-native'

import type { IconColorType } from '@/theme/colors'

export type TextInputWidth = number | 'auto'

export type TextInputSize = 'small' | 'large'

export interface MyTextInputProps extends Omit<TextInputProps, 'style' | 'editable'> {
  title?: string
  subTitle?: string
  /** @default 'small' — large = height 100 */
  size?: TextInputSize
  endIcon?: ReactNode
  startIcon?: ReactNode
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  showCurrentLength?: boolean
  maxLength?: number
  startText?: string
  endText?: string
  iconColor?: IconColorType
  onStartIconPress?: () => void
  onEndIconPress?: () => void
  /** @default 'auto' — auto = co dãn theo view cha, number = fix width */
  width?: TextInputWidth
  /** Override height of input row. Khi không truyền: small = auto, large = 100 */
  height?: number
  inputStyle?: StyleProp<TextStyle>
  ignoreValue?: boolean
  required?: boolean
}
