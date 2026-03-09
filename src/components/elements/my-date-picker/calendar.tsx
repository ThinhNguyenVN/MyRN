import React, { memo, useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'

import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { isNil } from 'lodash'

import { CalendarBase } from './calendar-base'
import YearMonthPickerView from './year-month-picker-view'
import {
  COLS,
  FALLBACK_CELL_WIDTH,
  getDaysForMonth,
  isSameDay,
  toDateOnly,
  type DayCell,
} from './calendar-utils'
import { generateStyles } from './styles'
import type { CalendarProps, CalendarPropsUnion, CalendarRangeProps } from './type'
import { useIsMobile } from '@/hooks/dimenstions-hooks'

function getInitialViewMonth(props: CalendarPropsUnion): Date {
  if (props.mode === 'single') {
    const value = props.value
    return value
      ? new Date(value.getFullYear(), value.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  }
  const initial = props.startDate ?? props.endDate ?? new Date()
  return new Date(initial.getFullYear(), initial.getMonth(), 1)
}

const CalendarInternal = memo(function CalendarInternal(props: CalendarPropsUnion) {
  const { mode, minDate, maxDate, onSelectDay, onYearMonthModeChange } = props
  const styles = useThemedStyles(generateStyles)
  const isMobile = useIsMobile()
  const { getSpacing } = useTheme()
  const [gridWidth, setGridWidth] = useState(0)
  const gap = getSpacing('x1')
  const cellWidth = gridWidth > 0 ? (gridWidth - (COLS - 1) * gap) / COLS : FALLBACK_CELL_WIDTH
  const cellStyle = useMemo(
    () => (!isMobile ? undefined : { width: cellWidth, flex: 0 as const }),
    [cellWidth, isMobile],
  )

  const [viewMonth, setViewMonth] = useState<Date>(() => getInitialViewMonth(props))
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false)
  const [pendingYear, setPendingYear] = useState(() => viewMonth.getFullYear())
  const [pendingMonth, setPendingMonth] = useState(() => viewMonth.getMonth())
  const pendingYearMonthRef = useRef({ year: pendingYear, month: pendingMonth })
  pendingYearMonthRef.current = { year: pendingYear, month: pendingMonth }

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

  const valueOnly = mode === 'single' && props.value ? toDateOnly(props.value) : null
  const startOnly = mode === 'range' && props.startDate ? toDateOnly(props.startDate) : null
  const endOnly = mode === 'range' && props.endDate ? toDateOnly(props.endDate) : null
  const todayOnly = useMemo(() => toDateOnly(new Date()), [])

  const renderCell = useCallback(
    (cell: DayCell, idx: number) => {
      const baseCellStyle = [styles.dayCell, cellStyle]
      if (!cell.isCurrentMonth) {
        return (
          <View
            key={`${idx}-other-month`}
            style={[baseCellStyle, styles.dayCellOtherMonth, styles.dayCellEmpty]}
          />
        )
      }

      if (mode === 'single') {
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
            <View style={styles.dayCellContent}>
              <MyText
                typography="label"
                style={[styles.dayCellText, selected && styles.dayCellSelectedText]}
              >
                {cell.date.getDate()}
              </MyText>
              {isToday ? (
                <View
                  style={[styles.dayCellTodayDot, selected && styles.dayCellTodayDotSelected]}
                />
              ) : null}
            </View>
          </MyPressable>
        )
      }

      const cellDate = toDateOnly(cell.date)
      const isStart = !isNil(startOnly) && isSameDay(cell.date, startOnly)
      const isEnd = !isNil(endOnly) && isSameDay(cell.date, endOnly)
      const inRange =
        !isNil(startOnly) &&
        !isNil(endOnly) &&
        cellDate.getTime() > startOnly.getTime() &&
        cellDate.getTime() < endOnly.getTime()
      const isRangeStartOrEnd = isStart || isEnd
      const isSingleDayRange = isStart && isEnd
      const isToday = isSameDay(cell.date, todayOnly)

      let rangeStyle = null
      let textStyle: typeof styles.dayCellText = styles.dayCellText
      if (isSingleDayRange) {
        rangeStyle = styles.dayCellRangeStartEnd
        textStyle = [
          styles.dayCellText,
          styles.dayCellRangeText,
        ] as unknown as typeof styles.dayCellText
      } else if (isStart) {
        rangeStyle = styles.dayCellRangeStart
        textStyle = [
          styles.dayCellText,
          styles.dayCellRangeText,
        ] as unknown as typeof styles.dayCellText
      } else if (isEnd) {
        rangeStyle = styles.dayCellRangeEnd
        textStyle = [
          styles.dayCellText,
          styles.dayCellRangeText,
        ] as unknown as typeof styles.dayCellText
      } else if (inRange) {
        rangeStyle = styles.dayCellInRange
      }

      return (
        <MyPressable
          key={`${idx}-day-cell`}
          onPress={() => !cell.disabled && onSelectDay(cell.date)}
          disabled={cell.disabled}
          style={[
            baseCellStyle,
            isToday && styles.dayCellToday,
            rangeStyle,
            cell.disabled && styles.dayCellDisabled,
          ]}
          haptic={false}
          animatedType="opacity"
        >
          <View style={styles.dayCellContent}>
            <MyText typography="label" style={textStyle}>
              {cell.date.getDate()}
            </MyText>
            {isToday ? (
              <View
                style={[
                  styles.dayCellTodayDot,
                  isRangeStartOrEnd && styles.dayCellTodayDotSelected,
                ]}
              />
            ) : null}
          </View>
        </MyPressable>
      )
    },
    [mode, styles, cellStyle, valueOnly, startOnly, endOnly, todayOnly, onSelectDay],
  )

  const openYearMonthPicker = useCallback(() => {
    const y = currentView.getFullYear()
    const m = currentView.getMonth()
    setPendingYear(y)
    setPendingMonth(m)
    pendingYearMonthRef.current = { year: y, month: m }
    setShowYearMonthPicker(true)
    onYearMonthModeChange?.(true)
  }, [currentView, onYearMonthModeChange])

  const handleYearMonthValueChange = useCallback(
    (v: { year: number; month: number }) => {
      pendingYearMonthRef.current = { year: v.year, month: v.month }
      setPendingYear(v.year)
      setPendingMonth(v.month)
      setViewMonth(new Date(v.year, v.month, 1))
      setShowYearMonthPicker(false)
      onYearMonthModeChange?.(false)
    },
    [onYearMonthModeChange],
  )

  if (showYearMonthPicker) {
    return (
      <YearMonthPickerView
        value={{ year: pendingYear, month: pendingMonth }}
        onValueChange={handleYearMonthValueChange}
        minDate={minDate}
        maxDate={maxDate}
      />
    )
  }

  return (
    <CalendarBase
      currentView={currentView}
      goPrev={goPrev}
      goNext={goNext}
      cells={cells}
      cellStyle={cellStyle}
      renderCell={renderCell}
      onGridLayout={setGridWidth}
      onHeaderPress={openYearMonthPicker}
    />
  )
})

const Calendar = memo(function Calendar(props: CalendarProps) {
  return <CalendarInternal {...props} mode="single" />
})
Calendar.displayName = 'Calendar'

export const CalendarRange = memo(function CalendarRange(props: CalendarRangeProps) {
  return <CalendarInternal {...props} mode="range" />
})
CalendarRange.displayName = 'CalendarRange'

export default Calendar
