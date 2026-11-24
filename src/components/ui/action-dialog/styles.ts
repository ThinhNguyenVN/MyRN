import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getSpacing } = theme
  return StyleSheet.create({
    dialogBody: {
      gap: getSpacing('x4'),
    },
    dialogFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: getSpacing('x3'),
    },
  })
}
