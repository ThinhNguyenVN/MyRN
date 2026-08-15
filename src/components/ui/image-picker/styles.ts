import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme

  return StyleSheet.create({
    root: {
      gap: getSpacing('x3'),
      width: '100%',
    },
    /** Positioning context for overlay + clear button. */
    dropzoneHost: {
      width: '100%',
      height: 200,
      position: 'relative',
    },
    dropzoneWrap: {
      width: '100%',
      position: 'relative',
    },
    dropzone: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: getColor('border/inactive/secondary'),
      borderRadius: getRadius('xl'),
      backgroundColor: getColor('fill/background/secondary'),
      height: '100%',
      width: '100%',
      overflow: 'hidden',
    },
    dropzonePressable: {
      flex: 1,
      width: '100%',
      height: '100%',
      padding: getSpacing('x8'),
      alignItems: 'center',
      justifyContent: 'center',
      gap: getSpacing('x2'),
    },
    /** Same fixed field size — only padding removed so preview can use the full frame. */
    dropzonePressableFilled: {
      flex: 1,
      width: '100%',
      height: '100%',
      padding: 0,
      alignItems: 'stretch',
      justifyContent: 'center',
    },
    uploadingOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getColor('fill/background/secondary'),
      opacity: 0.88,
      zIndex: 3,
    },
    dragOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getColor('fill/background/tertiary'),
      opacity: 0.92,
      zIndex: 3,
    },
    dragOverlayText: {
      color: getColor('text/active/primary'),
    },
    preview: {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: getColor('fill/background/secondary'),
    },
    previewImage: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
    clearButton: {
      position: 'absolute',
      top: getSpacing('x3'),
      right: getSpacing('x3'),
      zIndex: 4,
      elevation: 4,
    },
    hint: {
      color: getColor('text/active/tertiary'),
      textAlign: 'center',
    },
    error: {
      color: getColor('text/alert/primary'),
      textAlign: 'center',
    },
  })
}
