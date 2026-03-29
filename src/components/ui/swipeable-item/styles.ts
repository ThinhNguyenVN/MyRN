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
  const { getColor } = theme
  return StyleSheet.create({
    root: {
      overflow: 'hidden',
      position: 'relative',
    },
    underlayBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: getColor('fill/inactive/tertiary'),
    },
    leftStripAbs: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: ACTION_GAP,
      paddingLeft: 0,
      paddingRight: UNDERLAY_PADDING_X,
    },
    rightStripAbs: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: ACTION_GAP,
      paddingLeft: UNDERLAY_PADDING_X,
      paddingRight: 0,
    },
    foreground: {
      zIndex: 2,
      width: '100%',
      alignSelf: 'stretch',
      backgroundColor: getColor('fill/background/tertiary'),
    },
  })
}
