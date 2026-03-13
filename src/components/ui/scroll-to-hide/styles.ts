import { StyleSheet } from 'react-native'
import { ThemeType } from '@/theme/theme-context'
export const generateStyles = (_: ThemeType) => {
  return StyleSheet.create({
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      width: '100%',
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      zIndex: 10,
    },
    content: {
      flex: 1,
    },
  })
}
