import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getSpacing } = theme
  return StyleSheet.create({
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: getSpacing('x2'),
    },
  })
}
