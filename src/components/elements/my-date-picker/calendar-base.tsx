import React from 'react'
import { View } from 'react-native'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { COLS, getMonthYearLabel, getRowsFromCells, WEEKDAYS, type DayCell } from './calendar-utils'
import { generateStyles } from './styles'
import type { StyleProp, ViewStyle } from 'react-native'

export interface CalendarBaseProps {
  currentView: Date
  goPrev: () => void
  goNext: () => void
  cells: DayCell[]
  cellStyle?: StyleProp<ViewStyle>
  renderCell: (cell: DayCell, idx: number) => React.ReactNode
  onGridLayout: (width: number) => void
}

export function CalendarBase({
  currentView,
  goPrev,
  goNext,
  cells,
  cellStyle,
  renderCell,
  onGridLayout,
}: CalendarBaseProps) {
  const styles = useThemedStyles(generateStyles)
  const rows = getRowsFromCells(cells)

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
        onLayout={(e) => onGridLayout(e.nativeEvent.layout.width)}
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
}
