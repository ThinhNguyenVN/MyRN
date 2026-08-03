import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getColor } = theme
  return StyleSheet.create({
    horizontal: {
      alignSelf: 'stretch',
      height: StyleSheet.hairlineWidth,
      backgroundColor: getColor('border/inactive/secondary'),
    },
    vertical: {
      alignSelf: 'stretch',
      width: StyleSheet.hairlineWidth,
      backgroundColor: getColor('border/inactive/secondary'),
    },
  })
}
