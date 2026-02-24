import React, { memo, useMemo } from 'react'
import { View, ViewStyle } from 'react-native'

import { getColor } from '@/theme/colors'
import { Radius } from '@/theme/radius'
import { Spacing } from '@/theme/spacing'
import { isNil } from 'es-toolkit'

import type { MyViewProps } from './type'

const MyView: React.FC<MyViewProps> = ({
  style,
  backgroundColor,
  padding,
  paddingLeft,
  paddingRight,
  paddingTop,
  paddingBottom,
  margin,
  marginLeft,
  marginRight,
  marginTop,
  marginBottom,
  radius,
  children,
  ...rest
}) => {
  const tokenStyle = useMemo((): ViewStyle => {
    const s: ViewStyle = {}
    if (!isNil(backgroundColor)) s.backgroundColor = getColor(backgroundColor)
    if (!isNil(padding)) s.padding = Spacing[padding]
    if (!isNil(paddingLeft)) s.paddingLeft = Spacing[paddingLeft]
    if (!isNil(paddingRight)) s.paddingRight = Spacing[paddingRight]
    if (!isNil(paddingTop)) s.paddingTop = Spacing[paddingTop]
    if (!isNil(paddingBottom)) s.paddingBottom = Spacing[paddingBottom]
    if (!isNil(margin)) s.margin = Spacing[margin]
    if (!isNil(marginLeft)) s.marginLeft = Spacing[marginLeft]
    if (!isNil(marginRight)) s.marginRight = Spacing[marginRight]
    if (!isNil(marginTop)) s.marginTop = Spacing[marginTop]
    if (!isNil(marginBottom)) s.marginBottom = Spacing[marginBottom]
    if (!isNil(radius)) {
      s.overflow = 'hidden'
      s.borderRadius = Radius[radius]
    }
    return s
  }, [
    backgroundColor,
    padding,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    margin,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    radius,
  ])

  const hasTokenStyle = Object.keys(tokenStyle).length > 0
  const mergedStyle = hasTokenStyle ? [tokenStyle, style] : style

  return (
    <View style={mergedStyle} {...rest}>
      {children}
    </View>
  )
}

export default memo(MyView)
export type { MyViewProps } from './type'
