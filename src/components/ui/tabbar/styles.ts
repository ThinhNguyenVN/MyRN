import { Platform, StyleSheet } from 'react-native'

import { getPrivateTabBarHeight, getTabBarBottomPad } from '@/constants/dimensions'
import type { ThemeType } from '@/theme/theme-context'

export function generateTabBarStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius, insets } = theme
  const bottomInset = insets.bottom ?? 0
  const tabBarBottomPad = getTabBarBottomPad(bottomInset, getSpacing('x4'))
  const borderColor = getColor('border/inactive/secondary')

  return StyleSheet.create({
    tabBarFooter: {
      overflow: 'visible',
    },
    tabPressable: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
      backgroundColor: 'transparent',
    },
    pill: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: getSpacing('x2'),
      paddingHorizontal: getSpacing('x4'),
      borderRadius: getRadius('large'),
      minWidth: 48,
      gap: 2,
    },
    pillActive: {
      backgroundColor: getColor('border/info/secondary'),
    },
    tabBar: {
      backgroundColor: getColor('fill/background/tertiary'),
      // Override RN BottomTabBar defaults: light theme `borderColor` + elevation: 8
      // (reads as a thick bright top edge in dark mode, especially on web).
      borderColor,
      borderTopColor: borderColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      elevation: 0,
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
      ...(Platform.OS === 'web' ? { boxShadow: 'none' as const } : null),
      height: getPrivateTabBarHeight(bottomInset, getSpacing('x4')),
      paddingTop: getSpacing('x2'),
      paddingBottom: tabBarBottomPad,
      overflow: 'visible',
    },
    tabBarLabel: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 0,
    },
    tabBarIcon: {
      marginTop: 0,
      marginBottom: 0,
    },
  })
}
