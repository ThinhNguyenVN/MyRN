import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getSpacing } = theme

  return StyleSheet.create({
    root: {
      flex: 1,
    },
    rootHug: {
      flexGrow: 0,
      flexShrink: 0,
    },
    tabBar: {
      paddingBottom: getSpacing('x4'),
    },
    contentWrap: {
      flex: 1,
      overflow: 'hidden',
    },
    contentWrapHug: {
      overflow: 'hidden',
    },
  })
}
