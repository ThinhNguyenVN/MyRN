import type { StyleProp, ViewStyle } from 'react-native'

export interface DropdownOption {
  label: string
  value: string
  /** Set on product options (`null` = placeholder). Omit to hide the thumb column. */
  imageUrl?: string | null
  /** Optional quantity suffix rendered with tone color (inventory checks). */
  suffix?: string
  suffixTone?: 'success' | 'warning' | 'alert' | 'neutral'
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
  /** Native: always use the iOS/Android fullscreen picker (wins over `preferSheet`). */
  preferFullscreen?: boolean
  /** Optional fixed sheet height (`50%` / `90%`).
   * Omit on native to wrap content; web mobile defaults to `90%` when omitted. */
  sheetHeight?: string
  subTitle?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  style?: StyleProp<ViewStyle>
  /**
   * Remote mode (server search). When set, the picker always shows its search field, does not
   * filter `options` locally and calls this with the debounced query (`''` when closed).
   */
  onSearchChange?: (query: string) => void
  /** Remote mode: load the next page (called near the end of the list / "load more" row). */
  onEndReached?: () => void
  /** Remote mode: more pages exist. */
  hasMore?: boolean
  /** Remote mode: a next page is loading. */
  loadingMore?: boolean
  /**
   * Options for the current value(s) that may be missing from the loaded page — used only to
   * display the trigger label (e.g. editing a record whose product is on page 5).
   */
  selectedOptions?: DropdownOption[]
}
