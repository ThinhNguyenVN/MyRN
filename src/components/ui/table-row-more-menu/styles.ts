import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getSpacing } = theme
  return StyleSheet.create({
    itemList: {
      gap: getSpacing('x2'),
      width: '100%',
    },
  })
}
