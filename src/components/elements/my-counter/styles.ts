import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export function generateStyles(theme: ThemeType) {
  const { getSpacing } = theme
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: getSpacing('x4'),
    },
    numberWrap: {
      minWidth: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
}
