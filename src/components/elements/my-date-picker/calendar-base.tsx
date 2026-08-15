import React, { memo } from 'react'
import { View } from 'react-native'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { COLS, getMonthYearLabel, getRowsFromCells, WEEKDAYS } from './calendar-utils'
import { generateStyles } from './styles'
import type { CalendarBaseProps } from './type'

export const CalendarBase = memo(function CalendarBase({
  currentView,
  goPrev,
  goNext,
  cells,
  cellStyle,
  renderCell,
  onGridLayout,
  onHeaderPress,
}: CalendarBaseProps) {
  const styles = useThemedStyles(generateStyles)
  const rows = getRowsFromCells(cells)
  const monthYearLabel = getMonthYearLabel(currentView)

  return (
    <View>
      <View style={styles.calendarHeader}>
        <MyPressable onPress={goPrev} style={styles.calendarPrevNext}>
          <MyIcon name="chevron-back" size={24} color="icon/active/primary" />
        </MyPressable>
        {onHeaderPress ? (
          <MyPressable onPress={onHeaderPress} style={styles.calendarMonthYearTouch}>
            <MyText typography="label" style={styles.calendarMonthYear}>
              {monthYearLabel}
            </MyText>
          </MyPressable>
        ) : (
          <MyText typography="label" style={styles.calendarMonthYear}>
            {monthYearLabel}
          </MyText>
        )}
        <MyPressable onPress={goNext} style={styles.calendarPrevNext}>
          <MyIcon name="chevron-forward" size={24} color="icon/active/primary" />
        </MyPressable>
      </View>
      <View style={styles.calendarTableWrap} onLayout={onGridLayout}>
        <View style={styles.weekDayRow}>
          {WEEKDAYS.map((wd) => (
            <View key={`calendar-weekday-${wd}`} style={[styles.weekDayCell, cellStyle]}>
              <MyText typography="label" color="text/active/primary" style={styles.weekDayText}>
                {wd}
              </MyText>
            </View>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {rows.map((row, rowIdx) => (
            <View key={`calendar-days-row-${rowIdx}`} style={styles.daysRow}>
              {row.map((cell, cellIdx) => renderCell(cell, rowIdx * COLS + cellIdx))}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
})
