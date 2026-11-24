import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getSpacing, isMobileSize } = theme
  return StyleSheet.create({
    infoRow: {
      flexDirection: isMobileSize ? 'column' : 'row',
      gap: isMobileSize ? 2 : getSpacing('x4'),
    },
    infoLabel: {
      width: isMobileSize ? undefined : 140,
    },
    infoValue: {
      flex: isMobileSize ? undefined : 1,
      minWidth: 0,
    },
  })
}
