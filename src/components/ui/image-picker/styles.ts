import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const AVATAR_PICKER_SIZE = 140
export const DEFAULT_PICKER_SIZE = 120

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme

  return StyleSheet.create({
    /** Width comes from the `size` prop. */
    root: {
      gap: getSpacing('x2'),
    },
    rootAvatar: {
      gap: getSpacing('x3'),
      width: AVATAR_PICKER_SIZE,
      alignSelf: 'center',
    },
    /** Positioning context for overlay + clear button. */
    /** Width/height come from the `size` prop. */
    dropzoneHost: {
      position: 'relative',
    },
    dropzoneHostAvatar: {
      width: AVATAR_PICKER_SIZE,
      height: AVATAR_PICKER_SIZE,
      position: 'relative',
    },
    dropzone: {
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: getColor('border/inactive/secondary'),
      borderRadius: getRadius('medium'),
      backgroundColor: getColor('fill/background/secondary'),
      height: '100%',
      width: '100%',
      overflow: 'hidden',
    },
    dropzoneAvatar: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: getColor('border/inactive/secondary'),
      borderRadius: getRadius('full'),
      backgroundColor: getColor('fill/background/secondary'),
      height: '100%',
      width: '100%',
      overflow: 'hidden',
    },
    dropzonePressable: {
      flex: 1,
      width: '100%',
      height: '100%',
      padding: getSpacing('x2'),
      alignItems: 'center',
      justifyContent: 'center',
      gap: getSpacing('x1'),
    },
    dropzonePressableAvatar: {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
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
      top: getSpacing('x1'),
      right: getSpacing('x1'),
      zIndex: 4,
      elevation: 4,
    },
    thumbnailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: getSpacing('x4'),
      width: '100%',
    },
    thumbnailRowText: {
      flex: 1,
      minWidth: 0,
      gap: getSpacing('x1'),
    },
    rowHint: {
      color: getColor('text/active/tertiary'),
    },
    emptyTitle: {
      color: getColor('text/active/tertiary'),
      textAlign: 'center',
    },
    error: {
      color: getColor('text/alert/primary'),
    },
    sourceSheetBody: {
      gap: getSpacing('x3'),
      width: '100%',
      paddingBottom: getSpacing('x4'),
    },
  })
}
