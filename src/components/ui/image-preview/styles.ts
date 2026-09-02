import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) =>
  StyleSheet.create({
    // theme-exempt: fullscreen photo-viewer chrome stays dark regardless of app theme.
    container: {
      flex: 1,
      backgroundColor: '#0A0A0A',
    },
    // theme-exempt: see container above.
    page: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: '#0A0A0A',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    // theme-exempt: translucent white control over a photo, independent of app theme.
    closeButton: {
      position: 'absolute',
      right: theme.getSpacing('x4'),
      zIndex: 2,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.getRadius('full'),
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
    },
    // theme-exempt: see closeButton above.
    navigationButton: {
      position: 'absolute',
      top: '50%',
      zIndex: 2,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.getRadius('full'),
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
      transform: [{ translateY: -22 }],
    },
    previousButton: {
      left: theme.getSpacing('x4'),
    },
    nextButton: {
      right: theme.getSpacing('x4'),
    },
    disabledButton: {
      opacity: 0.3,
    },
    // theme-exempt: see closeButton above.
    counter: {
      position: 'absolute',
      alignSelf: 'center',
      zIndex: 2,
      paddingHorizontal: theme.getSpacing('x3'),
      paddingVertical: theme.getSpacing('x2'),
      borderRadius: theme.getRadius('full'),
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
    },
    counterText: {
      color: theme.getColor('brand/white'),
      fontSize: 13,
      lineHeight: 18,
    },
  })
