import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, insets } = theme

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: getColor('fill/background/primary'),
    },
    rootAndroid: {
      paddingTop: insets.top,
    },
    rootIosFullScreen: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    /** pageSheet: RN Modal không tự inset nội dung, footer sát đáy sheet cần padding tránh bị home indicator che. */
    rootIosPageSheet: {
      paddingBottom: insets.bottom,
    },
    keyboardAvoid: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: getSpacing('x2'),
      paddingLeft: getSpacing('x4'),
      paddingRight: getSpacing('x2'),
      paddingVertical: getSpacing('x4'),
    },
    title: {
      flex: 1,
      color: getColor('text/active/primary'),
    },
    closeHit: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
      minHeight: 0,
    },
    footer: {
      flexShrink: 0,
    },
  })
}
