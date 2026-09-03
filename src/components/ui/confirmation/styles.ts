import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getSpacing } = theme
  return StyleSheet.create({
    // theme-exempt: modal backdrop scrim stays the same dark tint in both themes.
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: getSpacing('x8'),
    },
    centered: {
      zIndex: 99,
    },
  })
}
