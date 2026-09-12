import { StyleSheet } from 'react-native'

import { FontFamily } from '@/theme/fonts'
import { Radius } from '@/theme/radius'
import type { ThemeType } from '@/theme/theme-context'

export const TRACK_PADDING = 3
export const ANIMATION_MS = 220

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme
  return StyleSheet.create({
    track: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      flexGrow: 0,
      flexShrink: 1,
      padding: TRACK_PADDING,
      borderRadius: Radius.full,
      backgroundColor: getColor('fill/background/secondary'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/secondary'),
      overflow: 'hidden',
    },
    trackFill: {
      alignSelf: 'stretch',
      width: '100%',
      flexShrink: 0,
    },
    trackDisabled: {
      opacity: 0.5,
    },
    pill: {
      position: 'absolute',
      top: TRACK_PADDING,
      bottom: TRACK_PADDING,
      left: TRACK_PADDING,
      borderRadius: Radius.full,
      backgroundColor: getColor('fill/active/primary'),
    },
    option: {
      flexGrow: 0,
      flexShrink: 1,
      zIndex: 1,
      minWidth: 44,
      height: 36,
      paddingHorizontal: getSpacing('x3'),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.full,
    },
    optionFill: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
    },
    optionCompact: {
      minWidth: 36,
      height: 32,
      paddingHorizontal: getSpacing('x2'),
    },
    optionLabel: {
      color: getColor('text/active/secondary'),
    },
    optionLabelActive: {
      color: getColor('brand/white'),
      fontFamily: FontFamily.semibold,
    },
  })
}
