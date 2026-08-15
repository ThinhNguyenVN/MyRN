import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    container: {
      backgroundColor: getColor('fill/inactive/primary'),
      justifyContent: 'center',
      alignItems: 'stretch',
      overflow: 'hidden',
    },
    /** Default when caller does not set both width + height. */
    square: {
      aspectRatio: 1,
    },
    image: {
      flex: 1,
      alignSelf: 'stretch',
    },
    emptyPlaceholder: {
      padding: getSpacing('x4'),
      backgroundColor: getColor('fill/inactive/secondary'),
      borderRadius: getSpacing('x2'),
      justifyContent: 'center',
      alignItems: 'center',
      gap: getSpacing('x2'),
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    skeletonContainer: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    skeletonBone: {
      flex: 1,
      alignSelf: 'stretch',
    },
    errorOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: getColor('fill/inactive/primary'),
    },
    message: {
      marginTop: getSpacing('x1'),
      textAlign: 'center',
    },
    touchable: {
      flex: 1,
      alignSelf: 'stretch',
    },
  })
}
