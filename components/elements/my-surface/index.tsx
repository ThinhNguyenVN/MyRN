import React, { memo, useMemo, useRef, useState } from 'react'
import { View, LayoutChangeEvent, StyleProp, ViewStyle, StyleSheet } from 'react-native'
import { Canvas, RoundedRect, Shadow } from '@shopify/react-native-skia'

import { Radius, RadiusType } from '@/theme/radius'
import { Spacing, SpacingType } from '@/theme/spacing'
import { ElevationToken, getElevation } from '@/theme/elevation'
import { SurfaceStyle } from './type'
import { splitSurfaceStyle } from './utils'

interface MySurfaceProps {
  elevation?: ElevationToken // "soft" | "medium/top-right"
  radius?: RadiusType
  padding?: SpacingType
  backgroundColor?: string
  style?: StyleProp<SurfaceStyle>
  children?: React.ReactNode
}

const MySurface: React.FC<MySurfaceProps> = ({
  elevation = 'soft', // default => soft/down-left
  radius = 'medium',
  padding = 'x4',
  backgroundColor,
  style,
  children,
}) => {
  const fs = useMemo(() => {
    if (!style) return {}
    return StyleSheet.flatten(style)
  }, [style])

  const hasStaticSize = typeof fs.width === 'number' && typeof fs.height === 'number'

  const sizeRef = useRef<{ w: number; h: number }>({
    w: hasStaticSize ? (fs.width as number) : 0,
    h: hasStaticSize ? (fs.height as number) : 0,
  })
  const [, forceUpdate] = useState(0)

  const onLayout = (e: LayoutChangeEvent) => {
    if (hasStaticSize) return
    const { width, height } = e.nativeEvent.layout
    const s = sizeRef.current
    if (s.w !== width || s.h !== height) {
      sizeRef.current = { w: width, h: height }
      forceUpdate((x) => x + 1)
    }
  }

  const { w = 0, h = 0 } = sizeRef.current

  const { resolvedBackgroundColor, styleWithoutBg } = useMemo(() => {
    const bgColor = backgroundColor ?? fs.backgroundColor ?? 'transparent'
    const { backgroundColor: _bg, ...rest } = fs
    return { resolvedBackgroundColor: bgColor, styleWithoutBg: rest }
  }, [backgroundColor, fs])

  const { containerStyle, contentStyle } = useMemo(
    () => splitSurfaceStyle(styleWithoutBg),
    [styleWithoutBg],
  )

  const shadowX = -8
  const shadowY = -8

  const positionX = 14
  const positionY = 14

  const containerWidth = w + 16
  const containerHeight = h + 16

  return (
    <View style={containerStyle} onLayout={onLayout}>
      {w > 0 && h > 0 && (
        <Canvas
          style={{
            width: containerWidth,
            height: containerHeight,
            position: 'absolute',
            left: -16,
            top: -16,
          }}
        >
          <RoundedRect
            x={positionX}
            y={positionY}
            width={w}
            height={h}
            r={0}
            color={resolvedBackgroundColor as string}
          >
            <Shadow dx={shadowX} dy={shadowY} blur={4} color="#0000004D" />
          </RoundedRect>
        </Canvas>
      )}

      <View style={contentStyle}>{children}</View>
    </View>
  )
}

export default memo(MySurface)
