import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme

  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: getSpacing('x3'),
      paddingHorizontal: getSpacing('x6'),
      paddingVertical: getSpacing('x4'),
      backgroundColor: getColor('fill/background/primary'),
    },
    titleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
      minWidth: 0,
    },
    title: {
      flexShrink: 1,
      color: getColor('text/active/primary'),
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
      flexShrink: 0,
    },
  })
}
