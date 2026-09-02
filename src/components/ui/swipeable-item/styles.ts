import { StyleSheet } from 'react-native'

import { BUTTON_SMALL_HEIGHT } from '@/components/elements/my-button/styles'
import type { ThemeType } from '@/theme/theme-context'

import { ACTION_GAP, UNDERLAY_PADDING_X } from './constants'

export function stripWidthPx(actionCount: number) {
  if (actionCount <= 0) return 0
  return (
    actionCount * BUTTON_SMALL_HEIGHT +
    Math.max(0, actionCount - 1) * ACTION_GAP +
    UNDERLAY_PADDING_X * 2
  )
}

export function generateStyles(theme: ThemeType) {
  const { getColor, getRadius } = theme
  return StyleSheet.create({
    /** Clips the trailing/leading action strips until the row is swiped open. */
    clip: {
      overflow: 'hidden',
      width: '100%',
      borderRadius: getRadius('large'),
      backgroundColor: getColor('fill/background/tertiary'),
    },
    /** Shadow/border layer — a sibling of `clip`, not a descendant, so it isn't cut by `clip`'s
     *  `overflow: hidden`; animated with the same `translateX` so it slides with the content. */
    cardShell: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    content: {
      flexGrow: 0,
      flexShrink: 0,
      backgroundColor: getColor('fill/background/tertiary'),
      borderWidth: 1,
    },
    /** First layout pass before clip width is measured. */
    contentFill: {
      width: '100%',
    },
    strip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ACTION_GAP,
      paddingHorizontal: UNDERLAY_PADDING_X,
      backgroundColor: getColor('fill/background/tertiary'),
    },
    stripLeft: {
      justifyContent: 'flex-end',
    },
    stripRight: {
      justifyContent: 'flex-start',
    },
  })
}
