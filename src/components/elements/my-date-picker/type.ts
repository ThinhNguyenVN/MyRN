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
}
