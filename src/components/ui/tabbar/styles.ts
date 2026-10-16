import { Platform, StyleSheet } from 'react-native'

import { getPrivateTabBarHeight, getTabBarBottomPad } from '@/constants/dimensions'
import type { ThemeType } from '@/theme/theme-context'

/** Diameter of the raised center action and how far it rises above the bar. */
export const TAB_BAR_CENTER_ACTION_SIZE = 56
const CENTER_ACTION_LIFT = 26
const CENTER_ACTION_RING = 4

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
    centerAction: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      overflow: 'visible',
      backgroundColor: 'transparent',
      gap: 2,
    },
    centerActionRing: {
      marginTop: -CENTER_ACTION_LIFT,
      width: TAB_BAR_CENTER_ACTION_SIZE + CENTER_ACTION_RING * 2,
      height: TAB_BAR_CENTER_ACTION_SIZE + CENTER_ACTION_RING * 2,
      borderRadius: getRadius('full'),
      padding: CENTER_ACTION_RING,
      backgroundColor: getColor('fill/background/tertiary'),
      overflow: 'visible',
    },
    centerActionMark: {
      width: 28,
      height: 28,
    },
    centerActionCircle: {
      flex: 1,
      borderRadius: getRadius('full'),
      alignItems: 'center',
      justifyContent: 'center',
      ...(Platform.OS === 'web'
        ? { boxShadow: `0 10px 22px -8px ${getColor('fill/active/primary')}99` as const }
        : {
            shadowColor: getColor('fill/active/primary'),
            shadowOpacity: 0.35,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }),
    },
    centerActionBadge: {
      position: 'absolute',
      top: -2,
      right: -10,
      paddingHorizontal: getSpacing('x2'),
      paddingVertical: 1,
      borderRadius: getRadius('full'),
      borderWidth: 2,
      borderColor: getColor('fill/background/tertiary'),
      backgroundColor: getColor('fill/warning/primary'),
    },
    centerActionBadgeText: {
      fontSize: 10,
      lineHeight: 13,
      fontWeight: '700',
    },
    centerActionLabel: {
      fontSize: 12,
      fontWeight: '600',
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
