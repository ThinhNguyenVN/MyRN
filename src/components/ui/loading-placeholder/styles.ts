import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getSpacing } = theme
  return StyleSheet.create({
    wrap: {
      paddingVertical: getSpacing('x8'),
      width: '100%',
    },
  })
}
