import { Radius } from '@/theme/radius'
import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    backdrop: {
      flex: 1,
    },
    panel: {
      position: 'absolute',
      borderRadius: Radius.medium,
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: 1,
      borderColor: getColor('border/inactive/tertiary'),
      padding: getSpacing('x4'),
      zIndex: 100,
    },
    contentWrap: {
      overflow: 'hidden',
    },
    footerWrap: {
      borderTopWidth: 1,
      borderTopColor: getColor('border/inactive/tertiary'),
      paddingTop: getSpacing('x4'),
      paddingBottom: getSpacing('x4'),
      marginTop: getSpacing('x2'),
    },
  })
}
