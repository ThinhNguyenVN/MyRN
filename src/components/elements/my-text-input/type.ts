import type { ComponentRef, ReactNode } from 'react'
import type { TextInput, TextInputProps, StyleProp, TextStyle, ViewStyle } from 'react-native'

import type { IconColorType } from '@/theme/colors'
import type { ContainerStyleProps } from '@/types/styles'
import type { FormatDisplayNumberOptions } from '@/utils/format-display-number'

/** Ref type: exposes all RN TextInput methods (focus, blur, clear, setNativeProps, measure, measureInWindow, measureLayout). */
export type MyTextInputRef = ComponentRef<typeof TextInput>

export type TextInputWidth = number | 'auto'

export type TextInputSize = 'small' | 'large'

export interface MyTextInputProps
  extends
    Omit<TextInputProps, 'style' | 'editable'>,
    Omit<ContainerStyleProps, 'width' | 'height'> {
  style?: StyleProp<ViewStyle>
  editable?: boolean
  useBottomSheetTextInput?: boolean
  title?: string
  subTitle?: string
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
  /** Hide the input field border (e.g. expandable header search). */
  borderless?: boolean
  inputStyle?: StyleProp<TextStyle>
  ignoreValue?: boolean
  required?: boolean
  /**
   * Format large numbers for display with locale thousands separators
   * (`1.000.000` vi / `1,000,000` en) and drop trailing fraction zeros.
   * Form value stays canonical (`1000000` / `1000000.5`, ASCII `.` decimal).
   */
  numberFormat?: boolean | FormatDisplayNumberOptions
}
