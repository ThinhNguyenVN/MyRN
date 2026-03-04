import type { ReactNode } from 'react'
import type { TextInputProps, StyleProp, TextStyle, ViewStyle } from 'react-native'

import type { IconColorType } from '@/theme/colors'
import type { ContainerStyleProps } from '@/types/styles'

export type TextInputWidth = number | 'auto'

export type TextInputSize = 'small' | 'large'

export interface MyTextInputProps
  extends
    Omit<TextInputProps, 'style' | 'editable'>,
    Omit<ContainerStyleProps, 'width' | 'height'> {
  /** Style for the outer container */
  style?: StyleProp<ViewStyle>
  /** When false, input is read-only (e.g. for dropdown trigger). */
  editable?: boolean
  /** @default false — Set true when this input is inside a BottomSheet on native to use keyboard-avoiding input. */
  useBottomSheetTextInput?: boolean
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
