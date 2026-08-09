import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const SIDEBAR_WIDTH = 260
export const SIDEBAR_FLUSH_WIDTH = 248
export const ITEM_ROW_HEIGHT = 44
export const ANIMATION_DURATION = 350
export const HIGHLIGHT_ANIMATION_DURATION = Math.round(ANIMATION_DURATION * 1.25)

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, insets, getRadius } = theme
  return StyleSheet.create({
    sidebarOuter: {
      zIndex: 2,
    },
    sidebarOuterFlush: {
      zIndex: 2,
      height: '100%',
    },

    sidebar: {
      flex: 1,
      margin: getSpacing('x2'),
      width: SIDEBAR_WIDTH,
      backgroundColor: getColor('fill/background/primary'),
      paddingTop: insets.top || getSpacing('x4'),
      paddingVertical: getSpacing('x4'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/secondary'),
    },
    sidebarFlush: {
      flex: 1,
      margin: 0,
      width: SIDEBAR_FLUSH_WIDTH,
      backgroundColor: getColor('fill/background/tertiary'),
      paddingTop: Math.max(insets.top ?? 0, getSpacing('x4')),
      paddingBottom: Math.max(insets.bottom ?? 0, getSpacing('x4')),
      paddingHorizontal: getSpacing('x3'),
      borderWidth: 0,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: getColor('border/inactive/secondary'),
      borderRadius: 0,
    },

    header: {
      marginBottom: getSpacing('x4'),
    },
    footer: {
      marginTop: getSpacing('x3'),
      paddingTop: getSpacing('x3'),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: getColor('border/inactive/secondary'),
      gap: getSpacing('x1'),
    },

    listContent: {
      flex: 1,
      paddingVertical: getSpacing('x1'),
      zIndex: 1,
    },

    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: getSpacing('x4'),
      minHeight: ITEM_ROW_HEIGHT,
      width: '100%',
      gap: getSpacing('x3'),
    },
    itemRowFlush: {
      paddingHorizontal: getSpacing('x3'),
    },
    itemRowLabel: {
      flex: 1,
      flexGrow: 1,
      width: '100%',
    },
    itemRowLeading: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
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
