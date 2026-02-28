import React, { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/theme/theme-context'
import type { IconColorType } from '@/theme/colors'
import type { ContainerStyleProps } from '@/types/styles'

import MyView from '../my-view'

export interface MyIconProps extends ContainerStyleProps {
  name: React.ComponentProps<typeof Ionicons>['name']
  size?: number
  color?: IconColorType | string
  style?: StyleProp<ViewStyle>
}

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
