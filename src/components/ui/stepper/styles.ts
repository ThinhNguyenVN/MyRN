import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius } = theme

  return StyleSheet.create({
    root: {
      width: '100%',
    },
    row: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
    },
    connectorsLayer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: 44,
      zIndex: 1,
    },
    /** Absolute segment; `left`/`width`/`top` set from row measure. */
    connector: {
      position: 'absolute',
      height: 4,
      borderRadius: getRadius('full'),
      overflow: 'hidden',
      backgroundColor: getColor('border/inactive/secondary'),
    },
    connectorFill: {
      height: '100%',
      borderRadius: getRadius('full'),
      backgroundColor: getColor('fill/active/primary'),
    },
    /** Equal columns — step centers stay fixed on next/back. */
    item: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      alignItems: 'center',
      zIndex: 2,
    },
    circleWrap: {
      width: 44,
      height: 44,
      borderRadius: getRadius('full'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleHalo: {
      backgroundColor: getColor('border/info/secondary'),
    },
    /** Fixed size for all states so nodes never shift. */
    circle: {
      width: 32,
      height: 32,
      borderRadius: getRadius('full'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleActive: {
      backgroundColor: getColor('fill/active/primary'),
    },
    circleIdle: {
      backgroundColor: getColor('fill/inactive/secondary'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/primary'),
    },
    circleText: {
      color: getColor('text/active/secondary'),
      fontWeight: '700',
    },
    circleTextOnActive: {
      color: getColor('brand/white'),
    },
    label: {
      marginTop: getSpacing('x2'),
      textAlign: 'center',
      width: '100%',
      paddingHorizontal: getSpacing('x1'),
    },
    labelActive: {
      color: getColor('fill/active/primary'),
      fontWeight: '600',
    },
    labelIdle: {
      color: getColor('text/active/secondary'),
    },
  })
}
