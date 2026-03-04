import type { StyleProp, ViewStyle } from 'react-native'

export interface DropdownOption {
  label: string
  value: string
}

export interface MyDropdownInputProps {
  options: DropdownOption[]
  /** Single: string | null. Multi: string[]. */
  value?: string | string[] | null
  onValueChange?: (value: string | string[]) => void
  placeholder?: string
  disabled?: boolean
  multiSelect?: boolean
  title?: string
  subTitle?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  style?: StyleProp<ViewStyle>
}
