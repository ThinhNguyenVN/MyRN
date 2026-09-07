import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme

  return StyleSheet.create({
    tableWidthProbe: {
      width: '100%',
    },
    panel: {
      width: '100%',
      backgroundColor: getColor('fill/background/tertiary'),
      borderRadius: getRadius('large'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/quaternary'),
      overflow: 'hidden',
    },
    tableScroll: {
      width: '100%',
    },
    tableScrollContent: {
      flexGrow: 1,
      minWidth: '100%',
    },
    tableMin: {
      flexGrow: 1,
      width: '100%',
      minWidth: '100%',
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: getSpacing('x3'),
      paddingVertical: getSpacing('x4'),
      paddingHorizontal: getSpacing('x6'),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: getColor('border/inactive/tertiary'),
      backgroundColor: getColor('fill/background/tertiary'),
    },
    tableHeaderCell: {
      color: getColor('text/active/secondary'),
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: getSpacing('x3'),
      paddingVertical: getSpacing('x4'),
      paddingHorizontal: getSpacing('x6'),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: getColor('border/inactive/quaternary'),
      backgroundColor: getColor('fill/background/tertiary'),
    },
  })
}
