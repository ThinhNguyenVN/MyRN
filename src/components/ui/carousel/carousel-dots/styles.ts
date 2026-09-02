import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: getSpacing('x3'),
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: getColor('border/active/primary'),
      backgroundColor: 'transparent',
    },
    dotActive: {
      backgroundColor: getColor('fill/active/primary'),
    },
  })
}
