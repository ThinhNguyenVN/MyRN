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
      <Ionicons name={name} size={size} color={resolvedColor} includeFontPadding={false} />
    </MyView>
  )
}

export default memo(MyIcon)
