import { MAX_INPUT_WIDTH } from '@/constants/dimensions'
import { Radius } from '@/theme/radius'
import type { ThemeType } from '@/theme/theme-context'
import type { ViewStyle } from 'react-native'
import { Platform, StyleSheet } from 'react-native'

const isWeb = Platform.OS === 'web'

const webGridRow = (gap: number): ViewStyle =>
  isWeb
    ? ({
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap,
      } as unknown as ViewStyle)
    : { flexDirection: 'row' as const, gap }

const DAY_CELL_SIZE = 36
const CALENDAR_PANEL_MIN_WIDTH = 280

function getStateColors(theme: ThemeType) {
  const { getColor } = theme
  return {
    default: {
      border: getColor('border/inactive/primary'),
      value: getColor('text/active/primary'),
      placeholder: getColor('text/inactive/primary'),
    },
    disabled: {
      border: getColor('border/inactive/secondary'),
      value: getColor('text/inactive/primary'),
      placeholder: getColor('text/inactive/secondary'),
    },
    error: {
      border: getColor('text/alert/primary'),
      value: getColor('text/alert/primary'),
      placeholder: getColor('text/inactive/primary'),
    },
    focus: {
      border: getColor('border/active/primary'),
      value: getColor('text/active/primary'),
      placeholder: getColor('text/inactive/primary'),
    },
  }
}

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  const stateColors = getStateColors(theme)
  return {
    stateColors,
    ...StyleSheet.create({
      triggerWrap: {
        width: '100%',
      },
      triggerInput: {
        marginBottom: 0,
      },
      relativeWrap: {
        position: 'relative',
      },
      modalBackdrop: {
        flex: 1,
      },
      dropdownPanel: {
        position: 'absolute',
        minWidth: CALENDAR_PANEL_MIN_WIDTH,
        maxWidth: MAX_INPUT_WIDTH,
        borderRadius: Radius.medium,
        backgroundColor: getColor('fill/background/tertiary'),
        borderWidth: 1,
        borderColor: getColor('border/inactive/tertiary'),
        padding: getSpacing('x4'),
        zIndex: 100,
      },
      calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: getSpacing('x3'),
      },
      calendarMonthYear: {
        color: getColor('text/active/primary'),
      },
      calendarPrevNext: {
        padding: getSpacing('x2'),
      },
      calendarTableWrap: {
        width: '100%',
        minWidth: CALENDAR_PANEL_MIN_WIDTH,
      },
      weekDayRow: {
        marginBottom: getSpacing('x1'),
        ...webGridRow(getSpacing('x1')),
      },
      weekDayCell: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: getSpacing('x1'),
        ...(isWeb ? { minWidth: 0 } : { flex: 1, flexShrink: 0 }),
      },
      weekDayText: {
        color: getColor('text/inactive/primary'),
        textAlign: 'center',
      },
      daysGrid: {
        flexDirection: 'column',
        gap: getSpacing('x1'),
      },
      daysRow: {
        ...webGridRow(getSpacing('x1')),
      },
      dayCell: {
        height: DAY_CELL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radius.small,
        ...(isWeb ? { minWidth: 0 } : { flex: 1, flexShrink: 0 }),
      },
      dayCellToday: {
        backgroundColor: getColor('fill/background/secondary'),
      },
      dayCellTodayDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: getColor('fill/active/primary'),
        marginTop: 2,
      },
      dayCellTodayDotSelected: {
        backgroundColor: getColor('brand/white'),
      },
      dayCellSelected: {
        backgroundColor: getColor('fill/active/primary'),
      },
      dayCellSelectedText: {
        color: getColor('brand/white'),
      },
      dayCellInRange: {
        backgroundColor: getColor('fill/background/secondary'),
        borderRadius: Radius.small,
      },
      dayCellRangeStart: {
        backgroundColor: getColor('fill/active/primary'),
        borderRadius: Radius.small,
      },
      dayCellRangeEnd: {
        backgroundColor: getColor('fill/active/primary'),
        borderRadius: Radius.small,
      },
      dayCellRangeStartEnd: {
        backgroundColor: getColor('fill/active/primary'),
        borderRadius: Radius.small,
      },
      dayCellRangeText: {
        color: getColor('brand/white'),
      },
      dayCellDisabled: {
        opacity: 0.4,
      },
      dayCellOtherMonth: {
        opacity: 0,
        pointerEvents: 'none',
      },
      dayCellEmpty: {
        backgroundColor: 'transparent',
      },
      dayCellContent: {
        alignItems: 'center',
      },
      dayCellText: {
        color: getColor('text/active/primary'),
        textAlign: 'center',
        lineHeight: 13,
      },

      footerButtonRow: {
        flexDirection: 'row',
        gap: getSpacing('x2'),
        marginTop: getSpacing('x6'),
      },
    }),
  }
}

export const DAY_CELL_SIZE_EXPORT = DAY_CELL_SIZE
