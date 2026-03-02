import React, { memo, useId } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

export interface MyGradientProps {
  width: number
  height: number
  startColor: string
  endColor: string
  opacity?: number
  startOpacity?: number
  endOpacity?: number
  style?: StyleProp<ViewStyle>
}

const MyGradient: React.FC<MyGradientProps> = ({
  width,
  height,
  startColor,
  endColor,
  opacity = 1,
  startOpacity,
  endOpacity,
  style,
}) => {
  const gradientId = useId().replace(/:/g, '-')
  const start = startOpacity ?? opacity
  const end = endOpacity ?? opacity

  if (width <= 0 || height <= 0) return null

  return (
    <Svg width={width} height={height} style={style}>
      <Defs>
        <LinearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={0}
          x2={width}
          y2={0}
        >
          <Stop offset="0" stopColor={startColor} stopOpacity={start} />
          <Stop offset="1" stopColor={endColor} stopOpacity={end} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={`url(#${gradientId})`} />
    </Svg>
  )
}

MyGradient.displayName = 'MyGradient'

export default memo(MyGradient)
