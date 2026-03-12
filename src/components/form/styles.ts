import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing } = theme
  return StyleSheet.create({
    error: {
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: getSpacing('x1'),
    },
    field: {
      gap: getSpacing('x2'),
    },
  })
}
