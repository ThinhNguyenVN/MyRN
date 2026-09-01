import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, isMobileSize } = theme

  return StyleSheet.create({
    /**
     * Card chrome (Stitch): soft elevation + hairline border.
     * `radius` + `backgroundColor` are passed as `MySurface` props — style radius is ignored.
     * borderWidth/borderColor here ARE read from the flattened style by `MySurface`.
     */
    surface: {
      width: '100%',
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/quaternary'),
    },
    body: {
      padding: getSpacing(isMobileSize ? 'x4' : 'x8'),
      gap: getSpacing(isMobileSize ? 'x4' : 'x6'),
      width: '100%',
    },
    title: {
      color: getColor('text/active/primary'),
    },
  })
}
