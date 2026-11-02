import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: getSpacing('x2'),
      width: '100%',
      position: 'relative',
    },
    cell: {
      flex: 1,
      height: 58,
      borderWidth: 1,
      borderRadius: getRadius('large'),
      borderColor: getColor('border/inactive/primary'),
      backgroundColor: getColor('fill/background/tertiary'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellFilled: {
      borderColor: getColor('border/active/secondary'),
    },
    cellActive: {
      borderColor: getColor('brand/primary'),
      borderWidth: 2,
    },
    cellError: {
      borderColor: getColor('border/alert/primary'),
    },
    cellDisabled: {
      backgroundColor: getColor('fill/background/secondary'),
      borderColor: getColor('border/inactive/secondary'),
    },
    digit: {
      fontSize: 24,
      lineHeight: 30,
      fontVariant: ['tabular-nums'],
    },
    hiddenInput: {
      ...StyleSheet.absoluteFill,
      opacity: 0,
      color: 'transparent',
      fontSize: 16,
    },
  })
}
