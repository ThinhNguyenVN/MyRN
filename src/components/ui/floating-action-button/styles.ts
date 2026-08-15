import { StyleSheet } from 'react-native'

import { BUTTON_SMALL_HEIGHT } from '@/components/elements/my-button/styles'
import type { ThemeType } from '@/theme/theme-context'

export const FAB_SIZE = BUTTON_SMALL_HEIGHT + 12

export function generateStyles(_theme: ThemeType) {
  return StyleSheet.create({
    root: {
      position: 'absolute',
      zIndex: 20,
    },
    button: {
      width: FAB_SIZE,
      height: FAB_SIZE,
      minWidth: FAB_SIZE,
      minHeight: FAB_SIZE,
      borderRadius: FAB_SIZE / 2,
    },
  })
}
