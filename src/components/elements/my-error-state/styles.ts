import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing } = theme
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: getSpacing('x8'),
      paddingHorizontal: getSpacing('x4'),
      gap: getSpacing('x2'),
    },
    title: {
      textAlign: 'center',
    },
    message: {
      textAlign: 'center',
    },
    retry: {
      marginTop: getSpacing('x2'),
    },
  })
}
