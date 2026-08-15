import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: getSpacing('x3'),
      paddingVertical: getSpacing('x4'),
      paddingHorizontal: getSpacing('x6'),
      flexWrap: 'wrap',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: getColor('border/inactive/quaternary'),
      backgroundColor: getColor('fill/background/tertiary'),
    },
    summary: {
      color: getColor('text/active/secondary'),
      flexShrink: 1,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x2'),
    },
    navBtn: {
      width: 40,
      height: 40,
      borderRadius: getRadius('medium'),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/quaternary'),
    },
    navBtnDisabled: {
      opacity: 0.45,
    },
    pageBtn: {
      width: 40,
      height: 40,
      borderRadius: getRadius('medium'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    pageBtnActive: {
      backgroundColor: getColor('fill/active/primary'),
    },
    pageText: {
      color: getColor('text/active/secondary'),
    },
    pageTextActive: {
      color: getColor('brand/white'),
    },
  })
}
