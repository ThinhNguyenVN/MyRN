import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme

  return StyleSheet.create({
    base: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: getRadius('full'),
      borderWidth: StyleSheet.hairlineWidth,
    },
    sizeDefault: {
      paddingHorizontal: getSpacing('x2'),
      paddingVertical: getSpacing('x1'),
    },
    sizeCompact: {
      paddingHorizontal: getSpacing('x1'),
      paddingVertical: 2,
    },
    toneSuccess: {
      backgroundColor: getColor('border/success/secondary'),
      borderColor: getColor('border/success/primary'),
    },
    toneNeutral: {
      backgroundColor: getColor('fill/background/secondary'),
      borderColor: getColor('fill/background/secondary'),
    },
    toneAlert: {
      backgroundColor: getColor('border/alert/secondary'),
      borderColor: getColor('border/alert/primary'),
    },
    toneWarning: {
      backgroundColor: getColor('border/warning/secondary'),
      borderColor: getColor('border/warning/primary'),
    },
    toneInfo: {
      backgroundColor: getColor('border/info/secondary'),
      borderColor: getColor('border/info/primary'),
    },
    textSuccess: {
      color: getColor('text/success/primary'),
    },
    textNeutral: {
      color: getColor('text/active/secondary'),
    },
    textAlert: {
      color: getColor('text/alert/primary'),
    },
    textWarning: {
      color: getColor('text/warning/primary'),
    },
    textInfo: {
      color: getColor('text/info/primary'),
    },
  })
}
