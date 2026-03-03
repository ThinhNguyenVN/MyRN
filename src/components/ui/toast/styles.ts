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
    /** View bọc toast để ép maxWidth + padding; tránh Animated.View/Portal không truyền constraint */
    toastInnerWrap: {
      maxWidth: MAX_WIDTH,
      width: '100%',
      alignSelf: 'stretch',
    },
    /** Web: căn toast sang phải */
    toastInnerWrapWeb: {
      alignSelf: 'flex-end',
    },
    container: {
      maxWidth: MAX_WIDTH,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: getSpacing('x4'),
      borderRadius: Radius.medium,
      backgroundColor: getColor('fill/background/tertiary'),
      gap: getSpacing('x3'),
    },
    containerInfo: {},
    containerSuccess: {},
    containerWarning: {},
    containerError: {},
    text: {
      flex: 1,
    },
    description: {
      marginTop: 2,
    },
  })
}
