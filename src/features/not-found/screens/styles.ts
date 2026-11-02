import { StyleSheet } from 'react-native'

import { FontFamily } from '@/theme/fonts'
import type { ThemeType } from '@/theme/theme-context'

const CARD_MAX_WIDTH = 480

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius, isMobileSize } = theme

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: getColor('fill/background/primary'),
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x10'),
      gap: getSpacing('x8'),
    },
    card: {
      width: '100%',
      maxWidth: CARD_MAX_WIDTH,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/quaternary'),
    },
    cardBody: {
      alignItems: 'center',
      paddingHorizontal: getSpacing(isMobileSize ? 'x6' : 'x10'),
      paddingTop: getSpacing('x10'),
      paddingBottom: getSpacing('x8'),
    },
    code: {
      fontFamily: FontFamily.bold,
      fontSize: isMobileSize ? 88 : 112,
      lineHeight: isMobileSize ? 92 : 116,
      letterSpacing: -4,
      color: getColor('border/info/secondary'),
      textAlign: 'center',
      marginBottom: getSpacing('x4'),
    },
    description: {
      textAlign: 'center',
      maxWidth: 360,
    },
    pathPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x1'),
      maxWidth: '100%',
      marginTop: getSpacing('x4'),
      paddingVertical: getSpacing('x1'),
      paddingHorizontal: getSpacing('x3'),
      borderRadius: getRadius('full'),
      backgroundColor: getColor('fill/background/secondary'),
    },
    pathText: {
      flexShrink: 1,
    },
    actions: {
      width: '100%',
      flexDirection: isMobileSize ? 'column-reverse' : 'row',
      justifyContent: 'center',
      gap: getSpacing('x3'),
      marginTop: getSpacing('x8'),
    },
    actionButton: {
      flex: isMobileSize ? undefined : 1,
      maxWidth: isMobileSize ? undefined : 200,
    },
  })
}
