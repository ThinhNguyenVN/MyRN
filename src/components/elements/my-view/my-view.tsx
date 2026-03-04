import React, { memo, useMemo } from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'

import MySurface from '@/components/elements/my-surface'
import { Radius } from '@/theme/radius'
import { useTheme } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import { isNil } from 'lodash'

import type { MyViewProps } from './type'

const MyView: React.FC<MyViewProps> = ({
  style,
  backgroundColor,
  radius,
  elevation,
  fillParent = true,
  children,
  ...rest
}) => {
  const { getColor } = useTheme()

  const useSurface = !!elevation && elevation !== 'none'

  const containerStyle = useMemo(() => {
    const s = getContainerStyle(pickContainerProps<MyViewProps>(rest))
    if (!isNil(backgroundColor)) s.backgroundColor = getColor(backgroundColor!)
    if (!isNil(radius) && !useSurface) {
      s.overflow = 'hidden'
      s.borderRadius = Radius[radius!]
    }
    return s
  }, [rest, backgroundColor, radius, useSurface, getColor])

  const hasContainerStyle = Object.keys(containerStyle).length > 0
  const mergedStyle: StyleProp<ViewStyle> = hasContainerStyle ? [containerStyle, style] : style
  const viewProps = omitContainerProps(rest as Record<string, unknown>)
  const resolvedBg = !isNil(backgroundColor) ? getColor(backgroundColor!) : undefined

  if (useSurface) {
    return (
      <MySurface
        elevation={elevation}
        radius={radius ?? 'none'}
        fillParent={fillParent}
        style={mergedStyle}
        backgroundColor={resolvedBg}
      >
        {children}
      </MySurface>
    )
  }

  return (
    <View style={mergedStyle} {...viewProps}>
      {children}
    </View>
  )
}

export default memo(MyView)
