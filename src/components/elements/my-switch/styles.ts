import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

import { Radius } from '@/theme/radius'

export const TRACK_WIDTH = 44
export const TRACK_HEIGHT = 24
export const THUMB_SIZE = 20
export const TRACK_MARGIN = 2
export const THUMB_TRAVEL = TRACK_WIDTH - TRACK_MARGIN * 2 - THUMB_SIZE

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x2'),
    },
    track: {
      width: TRACK_WIDTH,
      height: TRACK_HEIGHT,
      borderRadius: Radius.full,
      backgroundColor: getColor('fill/inactive/primary'),
      justifyContent: 'center',
      paddingHorizontal: TRACK_MARGIN,
    },
    trackOn: {
      backgroundColor: getColor('fill/active/primary'),
    },
    trackDisabled: {
      opacity: 0.5,
    },
    thumb: {
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: Radius.full,
      backgroundColor: getColor('brand/white'),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    label: {
      flex: 1,
    },
  })
}
