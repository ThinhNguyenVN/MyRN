import { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing } = theme
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    heading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    animatedView: {
      overflow: 'hidden',
    },
    content: {
      padding: getSpacing('x4'),
    },
    wrapper: {
      width: '100%',
      position: 'absolute',
    },
  })
}
