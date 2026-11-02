import { StyleSheet } from 'react-native'

import { BUTTON_SMALL_HEIGHT } from '@/components/elements/my-button/styles'
import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getSpacing, getColor, getRadius } = theme
  return StyleSheet.create({
    avatar: {
      width: BUTTON_SMALL_HEIGHT,
      height: BUTTON_SMALL_HEIGHT,
      borderRadius: getRadius('full'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/quaternary'),
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
      width: '100%',
      justifyContent: 'center',
    },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: getRadius('full'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/quaternary'),
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getColor('fill/background/secondary'),
    },
    headerName: {
      flexShrink: 0,
    },
    itemList: {
      gap: getSpacing('x2'),
      width: '100%',
    },
  })
}
