import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getRadius, getSpacing, insets } = theme
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: getColor('fill/background/secondary'),
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: getSpacing('x4'),
      paddingTop: getSpacing('x4'),
      paddingBottom: (insets.bottom ?? 0) + 100,
      gap: getSpacing('x3'),
    },
    itemCard: {
      borderRadius: getRadius('medium'),
      backgroundColor: getColor('fill/background/primary'),
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x3'),
      gap: getSpacing('x1'),
      overflow: 'hidden',
    },
    itemTitle: {
      textDecorationLine: 'none',
    },
    itemTitleCompleted: {
      textDecorationLine: 'line-through',
    },
    emptyWrap: {
      paddingVertical: getSpacing('x8'),
      alignItems: 'center',
      justifyContent: 'center',
      gap: getSpacing('x2'),
    },
    helperText: {
      marginTop: getSpacing('x2'),
    },
    submitButton: {
      marginTop: getSpacing('x2'),
    },
    fieldGroup: {
      gap: getSpacing('x4'),
    },
    skeletonListWrap: {
      alignSelf: 'stretch',
      gap: getSpacing('x3'),
    },
    skeletonCard: {
      borderRadius: getRadius('small'),
      backgroundColor: getColor('fill/background/tertiary'),
      paddingHorizontal: getSpacing('x4'),
      paddingVertical: getSpacing('x3'),
      overflow: 'hidden',
    },
    skeletonCardInner: {
      alignSelf: 'stretch',
    },
  })
}

export const todoSkeletonRowLayout = [
  { key: 'title', width: '92%' as const, height: 16, marginBottom: 8 },
  { key: 'caption', width: '58%' as const, height: 12 },
]
