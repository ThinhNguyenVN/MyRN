import React, { memo } from 'react'
import { isNil } from 'lodash'
import { View, StyleProp, ViewStyle } from 'react-native'

import MySurface from '@/components/elements/my-surface'
import { Radius } from '@/theme/radius'
import { useTheme } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import type { MyViewProps } from './type'

const MyView: React.FC<MyViewProps> = ({
  style,
  backgroundColor,
  radius,
  elevation,
  fillParent = false,
  children,
  ...rest
}) => {
  const { getColor } = useTheme()

  const useSurface = !!elevation && elevation !== 'none'

  // Resolved once and reused below — `containerStyle.backgroundColor` and the `MySurface`
  // prop used to each call `getColor` separately for the same value.
  const resolvedBg = !isNil(backgroundColor) ? getColor(backgroundColor!) : undefined

  // `rest` is a fresh object every render (object-rest destructuring), so a useMemo keyed on
  // it would never hit its cache — plain computation avoids paying for that bookkeeping.
  const containerStyle = getContainerStyle(pickContainerProps<MyViewProps>(rest))
  if (!isNil(resolvedBg)) containerStyle.backgroundColor = resolvedBg
  if (!isNil(radius) && !useSurface) {
    containerStyle.overflow = 'hidden'
    containerStyle.borderRadius = Radius[radius!]
  }

  const hasContainerStyle = Object.keys(containerStyle).length > 0
  const mergedStyle: StyleProp<ViewStyle> = hasContainerStyle ? [containerStyle, style] : style
  const viewProps = omitContainerProps(rest as Record<string, unknown>)

  if (useSurface) {
    return (
      <MySurface
        {...viewProps}
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
