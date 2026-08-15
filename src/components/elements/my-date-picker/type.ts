import type { ReactNode } from 'react'
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'

export type DayCell = {
  date: Date
  isCurrentMonth: boolean
  disabled: boolean
}

export interface MyDatePickerProps {
  value?: Date | null
  onValueChange?: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  title?: string
  /** Hide the trigger field label when the parent (e.g. MyFormField) already shows it. */
  hideTitle?: boolean
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

export interface DatePickerTriggerProps {
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

export interface DatePickerTriggerRenderProps {
  openPicker: () => void
  disabled: boolean
  open: boolean
}

export interface DatePickerContentOpts {
  setYearMonthMode: (isOpen: boolean) => void
  yearMonthMode: boolean
}

export interface DatePickerShellProps {
  title: string
  disabled?: boolean
  footer?: ReactNode
  renderFooter?: (closePicker: () => void) => ReactNode
  renderTrigger: (props: DatePickerTriggerRenderProps) => ReactNode
  renderContent: (closePicker: () => void, contentOpts: DatePickerContentOpts) => ReactNode
  panelMinWidth?: number
  estimatedPanelHeight?: number
  contentContainerStyle?: StyleProp<ViewStyle>
  footerContainerStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}

export interface CalendarBaseProps {
  currentView: Date
  goPrev: () => void
  goNext: () => void
  cells: DayCell[]
  cellStyle?: StyleProp<ViewStyle>
  renderCell: (cell: DayCell, idx: number) => React.ReactNode
  onGridLayout: (event: LayoutChangeEvent) => void
  /** Khi có, vùng tháng/năm (giữa header) có thể bấm để mở year-month picker. */
  onHeaderPress?: () => void
}

export interface CalendarContentProps {
  value?: Date | null
  minDate?: Date
  maxDate?: Date
  closePicker: () => void
  setYearMonthMode: (isOpen: boolean) => void
  onSelectDay: (date: Date, closePicker: () => void) => void
}

export interface RangeCalendarContentProps {
  startDate: Date | null
  endDate: Date | null
  minDate?: Date
  maxDate?: Date
  onSelectDay: (date: Date) => void
  setYearMonthMode: (isOpen: boolean) => void
}

export interface RangeFooterProps {
  onClear: () => void
  onConfirm: () => void
  clearLabel: string
  confirmLabel: string
  rowStyle: StyleProp<ViewStyle>
}
