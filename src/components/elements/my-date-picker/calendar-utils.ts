import { DEFAULT_DATE_LOCALE } from '@/configs/themes'
import type { WheelPickerItem } from '@/components/elements/my-wheel-picker'

export const COLS = 7
export const FALLBACK_CELL_WIDTH = 36

export const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getMonthYearLabel(date: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_DATE_LOCALE, {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export type DayCell = { date: Date; isCurrentMonth: boolean; disabled: boolean }

export function getDaysForMonth(viewMonth: Date, minDate?: Date, maxDate?: Date): DayCell[] {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const firstWeekday = (first.getDay() + 6) % 7
  const daysInMonth = last.getDate()
  const min = minDate ? toDateOnly(minDate) : null
  const max = maxDate ? toDateOnly(maxDate) : null

  const cells: DayCell[] = []
  const startPad = firstWeekday
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevLast = new Date(prevYear, prevMonth + 1, 0).getDate()

  for (let i = 0; i < startPad; i++) {
    const d = new Date(prevYear, prevMonth, prevLast - startPad + 1 + i)
    cells.push({
      date: d,
      isCurrentMonth: false,
      disabled: !!((min && d < min) || (max && d > max)),
    })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    cells.push({
      date: d,
      isCurrentMonth: true,
      disabled: !!((min && d < min) || (max && d > max)),
    })
  }
  const remaining = 42 - cells.length
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(nextYear, nextMonth, day)
    cells.push({
      date: d,
      isCurrentMonth: false,
      disabled: !!((min && d < min) || (max && d > max)),
    })
  }
  return cells
}

export function getRowsFromCells<T>(cells: T[]): T[][] {
  const result: T[][] = []
  for (let i = 0; i < cells.length; i += COLS) {
    result.push(cells.slice(i, i + COLS))
  }
  return result
}

let monthItemsCache: { locale: string; items: WheelPickerItem[] } | null = null

/** Tháng 0–11, label theo locale. */
export function getMonthWheelItems(locale: string = DEFAULT_DATE_LOCALE): WheelPickerItem[] {
  if (monthItemsCache?.locale === locale) return monthItemsCache.items
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' })
  const items: WheelPickerItem[] = Array.from({ length: 12 }, (_, i) => ({
    label: formatter.format(new Date(2000, i, 1)),
    value: i,
  }))
  monthItemsCache = { locale, items }
  return items
}

export function getYearRange(minDate?: Date, maxDate?: Date): { minYear: number; maxYear: number } {
  const now = new Date()
  const minYear = minDate ? minDate.getFullYear() : now.getFullYear() - 50
  const maxYear = maxDate ? maxDate.getFullYear() : now.getFullYear() + 10
  return { minYear, maxYear: Math.max(maxYear, minYear) }
}

export function getYearWheelItems(minDate?: Date, maxDate?: Date): WheelPickerItem[] {
  const { minYear, maxYear } = getYearRange(minDate, maxDate)
  return Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
    const y = minYear + i
    return { label: String(y), value: y }
  })
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}
