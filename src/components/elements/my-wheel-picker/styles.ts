import { Radius } from '@/theme/radius'
import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const ITEM_HEIGHT = 40
export const VISIBLE_COUNT = 5

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    triggerWrap: {
      width: '100%',
    },
    sheetFooter: {
      paddingTop: getSpacing('x4'),
    },
    pickerContent: {
      paddingVertical: getSpacing('x2'),
    },

    wrap: {
      height: ITEM_HEIGHT * VISIBLE_COUNT,
      overflow: 'hidden' as const,
    },
    item: {
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    itemText: {
      color: getColor('text/active/primary'),
      textAlign: 'center' as const,
    },
    overlay: {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      height: ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2),
      pointerEvents: 'none' as const,
    },
    overlayTop: {
      top: 0,
      backgroundColor: getColor('fill/background/tertiary'),
      opacity: 0.85,
    },
    overlayBottom: {
      bottom: 0,
      backgroundColor: getColor('fill/background/tertiary'),
      opacity: 0.85,
    },
    highlight: {
      position: 'absolute' as const,
      left: getSpacing('x2'),
      right: getSpacing('x2'),
      top: ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2),
      height: ITEM_HEIGHT,
      borderRadius: Radius.small,
      borderWidth: 1,
      borderColor: getColor('border/inactive/tertiary'),
      backgroundColor: getColor('fill/background/secondary'),
      pointerEvents: 'none' as const,
    },
  })
}
