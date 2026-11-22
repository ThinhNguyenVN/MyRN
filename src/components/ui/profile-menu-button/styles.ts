import { StyleSheet } from 'react-native'

import { BUTTON_SMALL_HEIGHT } from '@/components/elements/my-button/styles'
import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getSpacing, getColor, getRadius } = theme
  const avatarBase = {
    borderRadius: getRadius('full'),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: getColor('border/inactive/quaternary'),
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: getColor('fill/background/secondary'),
  }
  return StyleSheet.create({
    avatar: {
      ...avatarBase,
      width: BUTTON_SMALL_HEIGHT,
      height: BUTTON_SMALL_HEIGHT,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
      width: '100%',
    },
    headerAvatar: {
      ...avatarBase,
      width: 40,
      height: 40,
    },
    headerText: {
      flexShrink: 1,
      minWidth: 0,
    },
    itemList: {
      gap: getSpacing('x2'),
      width: '100%',
    },
  })
}
