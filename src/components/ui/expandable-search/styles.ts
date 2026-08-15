import { StyleSheet } from 'react-native'

import { BUTTON_SMALL_HEIGHT } from '@/components/elements/my-button/styles'
import type { ThemeType } from '@/theme/theme-context'

export const EXPANDABLE_SEARCH_COLLAPSED_WIDTH = BUTTON_SMALL_HEIGHT
/** Match MyTextInput row minHeight so rounded border isn’t clipped into side arcs. */
export const EXPANDABLE_SEARCH_HEIGHT = 44

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    root: {
      height: EXPANDABLE_SEARCH_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      // Must stay visible — overflow:hidden + short height clipped the input border
      // into “parentheses” and cut off the close control on the trailing edge.
      overflow: 'visible',
    },
    inputWrap: {
      flex: 1,
      minWidth: 0,
      marginRight: getSpacing('x2'),
    },
    closeButton: {
      borderWidth: 0,
      flexShrink: 0,
    },
    searchButtonWrap: {
      position: 'relative',
      flexShrink: 0,
    },
    activeKeywordBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: getColor('fill/alert/primary'),
      borderWidth: 1.5,
      borderColor: getColor('fill/background/primary'),
      zIndex: 1,
    },
  })
}
