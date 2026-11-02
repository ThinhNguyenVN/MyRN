import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    section: {
      gap: getSpacing('x2'),
      width: '100%',
    },
    title: {
      color: getColor('text/active/secondary'),
    },
    optionList: {
      gap: getSpacing('x2'),
    },
  })
}
