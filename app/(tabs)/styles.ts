import { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    titleContainer: {
      alignItems: 'center',
      gap: getSpacing('x2'),
    },
    stepContainer: {
      gap: getSpacing('x2'),
      marginBottom: getSpacing('x2'),
      backgroundColor: getColor('fill/active/primary'),
    },
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
    },
  })
}
