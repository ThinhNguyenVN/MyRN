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
      overflow: 'hidden',
    },

    footerWrap: {
      flexShrink: 0,
      paddingTop: getSpacing('x4'),
    },
    contentWrap: {
      width: '100%',
      minHeight: 0,
      flexShrink: 1,
    },
  })
}
