import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    surface: {
      backgroundColor: getColor('fill/background/primary'),
      overflow: 'hidden',
    },
    content: {
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x3'),
      gap: getSpacing('x1'),
    },
  })
}
