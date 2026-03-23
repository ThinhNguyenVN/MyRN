import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing, getColor } = theme

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: getColor('fill/background/secondary'),
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: getSpacing('x6'),
      paddingBottom: getSpacing('x8'),
      paddingHorizontal: getSpacing('x4'),
      gap: getSpacing('x4'),
    },
    formContainer: {
      paddingTop: 50,

      // alignItems: 'center',
    },
    header: {
      gap: getSpacing('x2'),
      marginBottom: getSpacing('x2'),
    },
    title: {
      marginBottom: getSpacing('x1'),
    },
    inputFullWidth: {
      width: '100%',
      alignSelf: 'stretch',
    },
    rootError: {
      marginTop: -getSpacing('x2'),
    },
  })
}
