import { DEFAULT_DATE_LOCALE } from '@/configs/themes'

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
