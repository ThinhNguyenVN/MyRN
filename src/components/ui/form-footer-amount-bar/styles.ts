import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: getColor('fill/background/secondary'),
      borderRadius: getRadius('large'),
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x3'),
      gap: getSpacing('x3'),
    },
    stacked: {
      width: '100%',
    },
    compact: {
      flex: 1,
      minWidth: 0,
    },
    total: {
      alignItems: 'flex-start',
      flex: 1,
      minWidth: 0,
    },
    right: {
      marginLeft: 'auto',
      flexShrink: 0,
    },
    totalLabel: {
      color: getColor('text/active/secondary'),
    },
    totalValue: {
      color: getColor('fill/active/primary'),
      textAlign: 'left',
    },
  })
}
