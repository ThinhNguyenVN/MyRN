import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

const SIDEBAR_WIDTH = 260
export const ITEM_ROW_HEIGHT = 44
export const ANIMATION_DURATION = 350

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, insets, getRadius } = theme
  return StyleSheet.create({
    sidebarOuter: {
      zIndex: 2,
    },

    sidebar: {
      flex: 1,
      margin: getSpacing('x2'),
      width: SIDEBAR_WIDTH,
      backgroundColor: getColor('fill/background/primary'),
      paddingTop: insets.top || getSpacing('x4'),
      paddingVertical: getSpacing('x4'),
    },
    listContent: {
      flex: 1,
      paddingVertical: getSpacing('x1'),
      // paddingHorizontal: getSpacing('x4'),
      zIndex: 1,
    },

    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getSpacing('x4'),
      minHeight: ITEM_ROW_HEIGHT,
      width: '100%',
    },
    itemRowLabel: {
      flex: 1,
      flexGrow: 1,
      width: '100%',
    },
    itemRowIcon: {
      flexShrink: 0,
      marginLeft: getSpacing('x2'),
    },

    iconLayer: {
      position: 'absolute',
      left: 0,
      top: 0,
    },
    highlight: {
      position: 'absolute',
      top: 0,
      left: getSpacing('x2'),
      right: getSpacing('x2'),
      borderRadius: getRadius('medium'),
      zIndex: 0,
      minHeight: ITEM_ROW_HEIGHT,
      backgroundColor: getColor('fill/active/primary'),
    },
  })
}
