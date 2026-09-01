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
    itemList: {
      gap: getSpacing('x2'),
      width: '100%',
    },
  })
}
