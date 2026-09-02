import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      width: '100%',
      gap: theme.getSpacing('x3'),
    },
    frame: {
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
    },
    list: {
      overflow: 'hidden',
    },
    page: {
      flexShrink: 0,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    button: {
      position: 'absolute',
      top: '50%',
      zIndex: 2,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.getRadius('medium'),
      backgroundColor: theme.getColor('fill/background/tertiary'),
      transform: [{ translateY: -20 }],
    },
    buttonPrevious: {
      left: theme.getSpacing('x3'),
    },
    buttonNext: {
      right: theme.getSpacing('x3'),
    },
    buttonDisabled: {
      opacity: 0.35,
    },
    // theme-exempt: dark badge sits over the slide image regardless of app theme.
    counter: {
      position: 'absolute',
      right: theme.getSpacing('x3'),
      bottom: theme.getSpacing('x3'),
      zIndex: 2,
      paddingHorizontal: theme.getSpacing('x2'),
      paddingVertical: theme.getSpacing('x1'),
      borderRadius: theme.getRadius('medium'),
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
    },
    counterText: {
      color: theme.getColor('brand/white'),
      fontSize: 12,
      lineHeight: 16,
    },
    thumbnails: {
      gap: theme.getSpacing('x2'),
    },
    thumbnail: {
      width: theme.isMobileSize ? 80 : 112,
      height: theme.isMobileSize ? 45 : 63,
      overflow: 'hidden',
      borderWidth: 2,
      borderRadius: theme.getRadius('medium'),
      borderColor: 'transparent',
    },
    thumbnailActive: {
      borderColor: theme.getColor('border/active/primary'),
    },
    thumbnailImage: {
      width: theme.isMobileSize ? 76 : 108,
      height: theme.isMobileSize ? 41 : 59,
      aspectRatio: theme.isMobileSize ? 76 / 41 : 108 / 59,
      borderRadius: Math.max(theme.getRadius('medium') - 2, 0),
    },
  })
