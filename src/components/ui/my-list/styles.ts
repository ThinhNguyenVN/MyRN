import { StyleSheet } from 'react-native'
import { ThemeType } from '@/theme/theme-context'

const SPINNER_SIZE = 32

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing } = theme
  return StyleSheet.create({
    contentContainer: {
      paddingBottom: getSpacing('x4'),
    },
    flex: { flex: 1 },
    indicatorContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBox: {
      width: SPINNER_SIZE,
      height: SPINNER_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkAbsolute: {
      position: 'absolute',
    },
  })
}
