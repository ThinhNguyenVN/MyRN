import React, { memo, useCallback, useMemo, useRef, useState } from 'react'
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from 'react-native'
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

type CalendarStyles = ReturnType<typeof generateStyles>

interface SingleDayCellProps {
  cell: DayCell
  selected: boolean
  isToday: boolean
  cellStyle?: StyleProp<ViewStyle>
  styles: CalendarStyles
  onSelectDay: (date: Date) => void
}

const SingleDayCell = memo(function SingleDayCell({
  cell,
  selected,
  isToday,
  cellStyle,
  styles,
  onSelectDay,
}: SingleDayCellProps) {
  const handlePress = useCallback(() => {
    if (!cell.disabled) onSelectDay(cell.date)
  }, [cell.disabled, cell.date, onSelectDay])

  return (
    <MyPressable
      onPress={handlePress}
      disabled={cell.disabled}
      style={[
        styles.dayCell,
        cellStyle,
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
          <View style={[styles.dayCellTodayDot, selected && styles.dayCellTodayDotSelected]} />
        ) : null}
      </View>
    </MyPressable>
  )
})

interface RangeDayCellProps {
  cell: DayCell
  isStart: boolean
  isEnd: boolean
  inRange: boolean
  isToday: boolean
  cellStyle?: StyleProp<ViewStyle>
  styles: CalendarStyles
  onSelectDay: (date: Date) => void
}

const RangeDayCell = memo(function RangeDayCell({
  cell,
  isStart,
  isEnd,
  inRange,
  isToday,
  cellStyle,
  styles,
  onSelectDay,
}: RangeDayCellProps) {
  const handlePress = useCallback(() => {
    if (!cell.disabled) onSelectDay(cell.date)
  }, [cell.disabled, cell.date, onSelectDay])

  const isRangeStartOrEnd = isStart || isEnd
  const isSingleDayRange = isStart && isEnd

  let rangeStyle = null
  let textStyle: StyleProp<TextStyle> = styles.dayCellText
  if (isSingleDayRange) {
    rangeStyle = styles.dayCellRangeStartEnd
    textStyle = [styles.dayCellText, styles.dayCellRangeText]
  } else if (isStart) {
    rangeStyle = styles.dayCellRangeStart
    textStyle = [styles.dayCellText, styles.dayCellRangeText]
  } else if (isEnd) {
    rangeStyle = styles.dayCellRangeEnd
    textStyle = [styles.dayCellText, styles.dayCellRangeText]
  } else if (inRange) {
    rangeStyle = styles.dayCellInRange
  }

  return (
    <MyPressable
      onPress={handlePress}
      disabled={cell.disabled}
      style={[
        styles.dayCell,
        cellStyle,
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
            style={[styles.dayCellTodayDot, isRangeStartOrEnd && styles.dayCellTodayDotSelected]}
          />
        ) : null}
      </View>
    </MyPressable>
  )
})

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

  const goPrevMonth = useCallback((d: Date) => new Date(d.getFullYear(), d.getMonth() - 1, 1), [])
  const goNextMonth = useCallback((d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1), [])

  const goPrev = useCallback(() => {
    setViewMonth(goPrevMonth)
  }, [goPrevMonth])
  const goNext = useCallback(() => {
    setViewMonth(goNextMonth)
  }, [goNextMonth])

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
      if (!cell.isCurrentMonth) {
        return (
          <View
            key={`calendar-day-empty-${idx}`}
            style={[styles.dayCell, cellStyle, styles.dayCellOtherMonth, styles.dayCellEmpty]}
          />
        )
      }

      if (mode === 'single') {
        const selected = !isNil(valueOnly) && isSameDay(cell.date, valueOnly)
        const isToday = isSameDay(cell.date, todayOnly)
        return (
          <SingleDayCell
            key={`calendar-day-${idx}`}
            cell={cell}
            selected={selected}
            isToday={isToday}
            cellStyle={cellStyle}
            styles={styles}
            onSelectDay={onSelectDay}
          />
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
      const isToday = isSameDay(cell.date, todayOnly)

      return (
        <RangeDayCell
          key={`calendar-day-${idx}`}
          cell={cell}
          isStart={isStart}
          isEnd={isEnd}
          inRange={inRange}
          isToday={isToday}
          cellStyle={cellStyle}
          styles={styles}
          onSelectDay={onSelectDay}
        />
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

  const handleGridLayout = useCallback((e: LayoutChangeEvent) => {
    setGridWidth(e.nativeEvent.layout.width)
  }, [])

  const yearMonthValue = useMemo(
    () => ({ year: pendingYear, month: pendingMonth }),
    [pendingYear, pendingMonth],
  )

  if (showYearMonthPicker) {
    return (
      <YearMonthPickerView
        value={yearMonthValue}
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
      onGridLayout={handleGridLayout}
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
