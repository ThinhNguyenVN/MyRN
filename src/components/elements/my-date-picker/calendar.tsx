import React, { memo, useCallback, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { CalendarProps } from './type'
import { isNil } from 'lodash'
import { DEFAULT_DATE_LOCALE } from '@/configs/themes'

const COLS = 7
const FALLBACK_CELL_WIDTH = 36

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getMonthYearLabel(date: Date): string {
  return new Intl.DateTimeFormat(DEFAULT_DATE_LOCALE, { month: 'long', year: 'numeric' }).format(
    date,
  )
}

function getDaysForMonth(viewMonth: Date, minDate?: Date, maxDate?: Date) {
  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const firstWeekday = (first.getDay() + 6) % 7
  const daysInMonth = last.getDate()
  const min = minDate ? toDateOnly(minDate) : null
  const max = maxDate ? toDateOnly(maxDate) : null

  const cells: { date: Date; isCurrentMonth: boolean; disabled: boolean }[] = []
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

const Calendar = memo(function Calendar({ value, minDate, maxDate, onSelectDay }: CalendarProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
  const [gridWidth, setGridWidth] = useState(0)
  const gap = getSpacing('x1')
  const cellWidth = gridWidth > 0 ? (gridWidth - (COLS - 1) * gap) / COLS : FALLBACK_CELL_WIDTH
  const cellStyle = Platform.OS === 'web' ? undefined : { width: cellWidth, flex: 0 as const }

  const [viewMonth, setViewMonth] = useState<Date>(() =>
    value
      ? new Date(value.getFullYear(), value.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )

  const currentView = useMemo(
    () => new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1),
    [viewMonth],
  )

  const goPrev = useCallback(() => {
    setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }, [])
  const goNext = useCallback(() => {
    setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }, [])

  const cells = useMemo(
    () => getDaysForMonth(currentView, minDate, maxDate),
    [currentView, minDate, maxDate],
  )

  const rows = useMemo(() => {
    const result: (typeof cells)[] = []
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7))
    }
    return result
  }, [cells])

  const valueOnly = value ? toDateOnly(value) : null
  const todayOnly = useMemo(() => toDateOnly(new Date()), [])

  const renderCell = (cell: (typeof cells)[number], idx: number) => {
    const baseCellStyle = [styles.dayCell, cellStyle]
    if (!cell.isCurrentMonth) {
      return (
        <View
          key={`${idx}-other-month`}
          style={[baseCellStyle, styles.dayCellOtherMonth, styles.dayCellEmpty]}
        />
      )
    }
    const selected = !isNil(valueOnly) && isSameDay(cell.date, valueOnly)
    const isToday = isSameDay(cell.date, todayOnly)
    return (
      <MyPressable
        key={`${idx}-day-cell`}
        onPress={() => !cell.disabled && onSelectDay(cell.date)}
        disabled={cell.disabled}
        style={[
          baseCellStyle,
          isToday && styles.dayCellToday,
          selected && styles.dayCellSelected,
          cell.disabled && styles.dayCellDisabled,
        ]}
        haptic={false}
        animatedType="opacity"
      >
        <MyText
          typography="label"
          style={[styles.dayCellText, selected && styles.dayCellSelectedText]}
        >
          {cell.date.getDate()}
        </MyText>
      </MyPressable>
    )
  }

  return (
    <View>
      <View style={styles.calendarHeader}>
        <MyPressable onPress={goPrev} style={styles.calendarPrevNext}>
          <MyIcon name="chevron-back" size={24} color="icon/active/primary" />
        </MyPressable>
        <MyText typography="label" style={styles.calendarMonthYear}>
          {getMonthYearLabel(currentView)}
        </MyText>
        <MyPressable onPress={goNext} style={styles.calendarPrevNext}>
          <MyIcon name="chevron-forward" size={24} color="icon/active/primary" />
        </MyPressable>
      </View>
      <View
        style={styles.calendarTableWrap}
        onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
      >
        <View style={styles.weekDayRow}>
          {WEEKDAYS.map((wd) => (
            <View key={`${wd}-week-day-cell`} style={[styles.weekDayCell, cellStyle]}>
              <MyText typography="caption" style={styles.weekDayText}>
                {wd}
              </MyText>
            </View>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {rows.map((row, rowIdx) => (
            <View key={`${rowIdx}-days-row`} style={styles.daysRow}>
              {row.map((cell, cellIdx) => renderCell(cell, rowIdx * COLS + cellIdx))}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
})

Calendar.displayName = 'Calendar'

export default Calendar
