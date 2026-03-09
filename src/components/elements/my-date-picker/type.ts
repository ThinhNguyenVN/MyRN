import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export interface MyDatePickerProps {
  value?: Date | null
  onValueChange?: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  title?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  footer?: ReactNode
  style?: StyleProp<ViewStyle>
}

export interface CalendarProps {
  value?: Date | null
  minDate?: Date
  maxDate?: Date
  onSelectDay: (date: Date) => void
  /** Gọi khi mở/đóng panel chọn tháng-năm (để shell ẩn footer). */
  onYearMonthModeChange?: (isOpen: boolean) => void
}

export interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

export interface MyDateRangePickerProps {
  value?: DateRange | null
  onValueChange?: (range: DateRange) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  title?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  footer?: ReactNode
  style?: StyleProp<ViewStyle>
}

export interface CalendarRangeProps {
  startDate: Date | null
  endDate: Date | null
  minDate?: Date
  maxDate?: Date
  onSelectDay: (date: Date) => void
  /** Gọi khi mở/đóng panel chọn tháng-năm (để shell ẩn footer). */
  onYearMonthModeChange?: (isOpen: boolean) => void
}

export type CalendarPropsUnion =
  | (CalendarProps & { mode: 'single' })
  | (CalendarRangeProps & { mode: 'range' })

/** Month 0-indexed (0 = January). */
export interface YearMonthValue {
  year: number
  month: number
}

export interface YearMonthPickerViewProps {
  value: YearMonthValue
  onValueChange: (value: YearMonthValue) => void
  minDate?: Date
  maxDate?: Date
}

export interface DateRangePickerTriggerProps {
  open: boolean
  openPicker: () => void
  disabled: boolean
  displayText: string
  placeholder: string
  title?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  triggerInputStyle: StyleProp<ViewStyle>
}
