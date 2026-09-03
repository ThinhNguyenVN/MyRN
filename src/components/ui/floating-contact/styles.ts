import { Platform, StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing } = theme

  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: getSpacing('x8'),
      right: getSpacing('x6'),
      gap: 14,
      zIndex: 200,
      alignItems: 'center',
      ...(Platform.OS === 'web' ? { position: 'fixed' as const } : {}),
    },
    buttonWrap: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fab: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: getColor('brand/black'),
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    fabEmphasized: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    pulseRing: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 30,
    },
  })
}
