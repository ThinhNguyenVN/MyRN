import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getRadius, getSpacing } = theme
  return StyleSheet.create({
    list: {
      alignSelf: 'stretch',
      gap: getSpacing('x3'),
    },
    item: {
      borderRadius: getRadius('small'),
      backgroundColor: getColor('fill/background/tertiary'),
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x3'),
      overflow: 'hidden',
    },
    itemInner: {
      alignSelf: 'stretch',
    },
  })
}
