import type { StyleProp, ViewStyle } from 'react-native'

export interface DropdownOption {
  label: string
  value: string
  /** Set on product options (`null` = placeholder). Omit to hide the thumb column. */
  imageUrl?: string | null
}

export interface DropdownOptionRowProps {
  option: DropdownOption
  selected: boolean
  multiSelect: boolean
  onSelect: (value: string) => void
}

export interface MyDropdownInputProps {
  options: DropdownOption[]
  /** Single: string | null. Multi: string[]. */
  value?: string | string[] | null
  onValueChange?: (value: string | string[]) => void
  placeholder?: string
  disabled?: boolean
  /** First fetch in progress — trigger stays locked with a loading placeholder. */
  loading?: boolean
  multiSelect?: boolean
  /** When omitted, optional fields (`required` false) can clear the value. */
  allowClear?: boolean
  title?: string
  /** Sheet / fullscreen picker heading. Falls back to `title`. */
  pickerTitle?: string
  /** Override auto search (shown when the option list is long). */
  searchable?: boolean
  /** Native: always use a bottom sheet, even when the option list is long. */
  preferSheet?: boolean
  subTitle?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  style?: StyleProp<ViewStyle>
}
