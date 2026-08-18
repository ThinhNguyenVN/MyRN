import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const SIDEBAR_COLLAPSE_TOGGLE_SIZE = 36
export const SIDEBAR_COLLAPSE_TOGGLE_OFFSET = SIDEBAR_COLLAPSE_TOGGLE_SIZE / 2

export function generateSidebarCollapseToggleStyles(theme: ThemeType) {
  const { getColor } = theme
  return StyleSheet.create({
    root: {
      width: SIDEBAR_COLLAPSE_TOGGLE_SIZE,
      height: SIDEBAR_COLLAPSE_TOGGLE_SIZE,
    },
    surface: {
      width: SIDEBAR_COLLAPSE_TOGGLE_SIZE,
      height: SIDEBAR_COLLAPSE_TOGGLE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: 1,
      borderColor: getColor('border/inactive/primary'),
    },
    iconWrap: {
      width: SIDEBAR_COLLAPSE_TOGGLE_SIZE,
      height: SIDEBAR_COLLAPSE_TOGGLE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
}
