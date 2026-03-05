import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'
import { getSpacing } from '@/theme/spacing'

export function generateStyles(theme: ThemeType) {
  const { getColor, insets } = theme
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x2'),
      paddingTop: insets.top || getSpacing('x4'),
      backgroundColor: getColor('fill/background/primary'),
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    center: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',

      top: insets.top || getSpacing('x4'),
      left: getSpacing('x4'),
      right: getSpacing('x4'),
      bottom: getSpacing('x2'),

      zIndex: 1,
    },

    right: {
      minWidth: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    title: {
      textAlign: 'center',
    },
    contentHeight: {
      opacity: 0,
      zIndex: -1,
    },
  })
}
