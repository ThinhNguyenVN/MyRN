import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
      paddingHorizontal: getSpacing('x3'),
      paddingVertical: getSpacing('x3'),
      borderRadius: getRadius('medium'),
      backgroundColor: getColor('fill/background/tertiary'),
    },
    thumb: {
      width: 56,
      height: 56,
      borderRadius: getRadius('small'),
      backgroundColor: getColor('fill/background/secondary'),
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    thumbImage: {
      width: '100%',
      height: '100%',
    },
    body: {
      flex: 1,
      minWidth: 0,
      gap: getSpacing('x1'),
    },
    title: {
      color: getColor('fill/active/primary'),
    },
    subtitle: {
      color: getColor('text/active/tertiary'),
    },
    trailing: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: getSpacing('x1'),
      maxWidth: '36%',
    },
  })
}
