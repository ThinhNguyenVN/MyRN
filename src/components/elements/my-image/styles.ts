import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return {
    container: {
      backgroundColor: getColor('fill/inactive/primary'),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      overflow: 'hidden' as const,
      aspectRatio: 1,
    },
    image: {
      flex: 1,
      alignSelf: 'stretch' as const,
    },
    emptyPlaceholder: {
      padding: getSpacing('x4'),
      backgroundColor: getColor('fill/inactive/secondary'),
      borderRadius: getSpacing('x2'),
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      gap: getSpacing('x2'),
    },
    loadingOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: getColor('fill/inactive/primary'),
    },
    errorOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: getColor('fill/inactive/primary'),
    },
    message: {
      marginTop: getSpacing('x1'),
      textAlign: 'center' as const,
    },
  }
}
