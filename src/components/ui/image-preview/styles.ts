import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0A0A0A',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    imageFrame: {
      backgroundColor: '#0A0A0A',
    },
    image: {
      width: '100%',
      height: '100%',
      backgroundColor: '#0A0A0A',
    },
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
    counter: {
      position: 'absolute',
      zIndex: 2,
      paddingHorizontal: theme.getSpacing('x3'),
      paddingVertical: theme.getSpacing('x2'),
      borderRadius: theme.getRadius('full'),
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
    },
    counterText: {
      color: '#FFFFFF',
      fontSize: 13,
      lineHeight: 18,
    },
  })
