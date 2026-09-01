import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme
  return StyleSheet.create({
    section: {
      gap: getSpacing('x2'),
      width: '100%',
    },
    sectionLabel: {
      paddingHorizontal: getSpacing('x1'),
    },
    card: {
      width: '100%',
      borderRadius: getRadius('medium'),
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/secondary'),
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
      minHeight: 56,
      paddingHorizontal: getSpacing('x5'),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: getColor('border/inactive/secondary'),
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLabel: {
      flex: 1,
      color: getColor('text/active/primary'),
    },
  })
}
