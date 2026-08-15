import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, insets } = theme
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: getColor('fill/background/secondary'),
    },
    scroll: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
      paddingHorizontal: getSpacing('x4'),
      paddingTop: getSpacing('x4'),
      paddingBottom: (insets.bottom ?? 0) + 100,
      gap: getSpacing('x3'),
    },
    itemTitle: {
      textDecorationLine: 'none',
    },
    itemTitleCompleted: {
      textDecorationLine: 'line-through',
    },
    helperText: {
      marginTop: getSpacing('x2'),
    },
    submitButton: {
      marginTop: getSpacing('x2'),
    },
    fieldGroup: {
      gap: getSpacing('x4'),
    },
  })
}
