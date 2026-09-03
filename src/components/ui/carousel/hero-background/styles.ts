import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

// `theme` unused here — kept for signature consistency with other generateStyles(theme) factories.
export const generateStyles = (_theme: ThemeType) => {
  return StyleSheet.create({
    heroBackgroundBase: {
      overflow: 'hidden',
    },
    heroBackgroundBaseImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    // theme-exempt: darkening scrim over the hero photo, independent of light/dark theme.
    heroBackgroundOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
  })
}
