import { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing } = theme
  return StyleSheet.create({
    contentContainer: {
      paddingBottom: getSpacing('x4'),
    },
  })
}
