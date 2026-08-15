import type { ThemeType } from '@/theme/theme-context'
import { Radius } from '@/theme/radius'

import { StyleSheet } from 'react-native'

const MAX_WIDTH = 300

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, insets } = theme

  const paddingH = getSpacing('x4')
  const paddingBottomMobile = (insets.bottom ?? 0) + getSpacing('x4')
  const paddingTopWeb = getSpacing('x6')

  return StyleSheet.create({
    toastPosition: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: paddingH,
      paddingBottom: paddingBottomMobile,
    },
    toastPositionWeb: {
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: paddingTopWeb,
    },
    toastInnerWrap: {
      maxWidth: MAX_WIDTH,
      width: '100%',
      alignSelf: 'center',
    },
    /** Web: căn toast sang phải */
    toastInnerWrapWeb: {
      alignSelf: 'flex-end',
    },
    container: {
      maxWidth: MAX_WIDTH,
      width: '100%',
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      padding: getSpacing('x4'),
      borderRadius: Radius.medium,
      backgroundColor: getColor('fill/background/tertiary'),
      gap: getSpacing('x3'),
    },
    toastRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: getSpacing('x3'),
    },
    toastIcon: {
      flexShrink: 0,
    },
    toastBody: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
    toastText: {
      flexShrink: 1,
    },
    containerInfo: {},
    containerSuccess: {},
    containerWarning: {},
    containerError: {},

    description: {
      marginTop: 2,
    },
  })
}
