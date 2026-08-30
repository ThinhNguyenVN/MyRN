import { StyleSheet } from 'react-native'

import { FontFamily } from '@/theme/fonts'
import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme

  return StyleSheet.create({
    root: {
      flex: 1,
    },
    tabBar: {
      flexDirection: 'row',
      gap: getSpacing('x2'),
      backgroundColor: getColor('fill/background/secondary'),
      borderWidth: 1,
      borderColor: getColor('border/inactive/quaternary'),
    },
    tabItem: {
      flex: 1,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: getRadius('medium'),
      backgroundColor: getColor('fill/background/tertiary'),
    },
    tabItemActive: {
      backgroundColor: getColor('fill/active/primary'),
    },
    tabLabel: {
      color: getColor('text/active/secondary'),
    },
    tabLabelActive: {
      color: getColor('brand/white'),
      fontFamily: FontFamily.medium,
    },
    contentWrap: {
      flex: 1,
      overflow: 'hidden',
    },
  })
}
