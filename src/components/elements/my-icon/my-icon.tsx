import React, { memo } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/theme/theme-context'
import type { IconColorType } from '@/theme/colors'

import MyView from '../my-view'
import type { MyIconProps } from './type'

const DEFAULT_SIZE = 20
const DEFAULT_COLOR_TOKEN: IconColorType = 'icon/active/primary'

const MyIcon: React.FC<MyIconProps> = ({
  name,
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR_TOKEN,
  style,
  ...rest
}) => {
  const { getColor } = useTheme()
  const resolvedColor = color.startsWith('icon/') ? getColor(color as IconColorType) : color

  return (
    <MyView {...rest} style={style}>
      {/* lineHeight = size: on web the icon font's default line height makes the box taller
          than the glyph, so icons sat ~1px off-centre inside circles and badges. */}
      <Ionicons
        name={name}
        size={size}
        color={resolvedColor}
        includeFontPadding={false}
        style={{ lineHeight: size }}
      />
    </MyView>
  )
}

export default memo(MyIcon)
