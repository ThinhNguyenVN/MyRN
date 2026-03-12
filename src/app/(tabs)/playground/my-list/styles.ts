import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

/** Layout config cho Skeleton (không phải style). */
export const skeletonThumbLayout = [{ key: 'thumb', width: 72, height: 72 }]
export const skeletonTextLayout = [
  { key: 'title', width: 200, height: 16, marginBottom: 6 },
  { key: 'desc', width: 180, height: 12 },
]

export function generateStyles(theme: ThemeType) {
  const { getSpacing } = theme
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      padding: getSpacing('x2'),
      gap: getSpacing('x2'),
      marginHorizontal: 16,
      marginBottom: getSpacing('x2'),
    },
    thumb: {
      width: 72,
      height: 72,
      borderRadius: 6,
    },
    textBlock: {
      flex: 1,
      justifyContent: 'center',
      minWidth: 0,
    },
    title: {
      marginBottom: 4,
    },
    desc: {},
    // Footer / empty state
    footer: {
      paddingVertical: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Skeleton row
    skeletonRow: {
      flexDirection: 'row' as const,
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 8,
    },
    skeletonThumbContainer: {
      width: 72,
      height: 72,
    },
    skeletonTextBlock: {
      flex: 1,
      justifyContent: 'center' as const,
    },
    skeletonListContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
  })
}
