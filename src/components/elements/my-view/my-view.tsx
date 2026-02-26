import React, { memo, useMemo } from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'

import { Radius } from '@/theme/radius'
import { useTheme } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import { isNil } from 'lodash'

import type { MyViewProps } from './type'

const MyView: React.FC<MyViewProps> = ({ style, backgroundColor, radius, children, ...rest }) => {
  const { getColor } = useTheme()

  const containerStyle = useMemo(() => {
    const s = getContainerStyle(pickContainerProps<MyViewProps>(rest))
    if (!isNil(backgroundColor)) s.backgroundColor = getColor(backgroundColor!)
    if (!isNil(radius)) {
      s.overflow = 'hidden'
      s.borderRadius = Radius[radius!]
    }
    return s
  }, [rest, backgroundColor, radius, getColor])

  const hasContainerStyle = Object.keys(containerStyle).length > 0
  const mergedStyle: StyleProp<ViewStyle> = hasContainerStyle ? [containerStyle, style] : style
  const viewProps = omitContainerProps(rest as Record<string, unknown>)

  return (
    <View style={mergedStyle} {...viewProps}>
      {children}
    </View>
  )
}

export default memo(MyView)
