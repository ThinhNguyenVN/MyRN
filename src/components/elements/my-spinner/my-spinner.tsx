import React, { useCallback, useEffect, useMemo } from 'react'
import { Circle, Svg } from 'react-native-svg'
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/theme/theme-context'
import type { ColorToken } from '@/theme/colors'

import MyView from '../my-view'

import { styles } from './styles'
import type {
  MySpinnerProps,
  SpinnerColor,
  SpinnerColors,
  SpinnerDimensions,
  SpinnerSize,
} from './type'

export function getSpinnerSize(size: SpinnerSize): SpinnerDimensions {
  switch (size) {
    case 'small':
      return { size: 24, strokeWidth: 2.5 }
    case 'xsmall':
      return { size: 16, strokeWidth: 1.5 }
    default:
      return { size: 32, strokeWidth: 3 }
  }
}

const SPINNER_COLOR_TOKENS: Record<SpinnerColor, { track: ColorToken; stroke: ColorToken }> = {
  dark: { track: 'fill/inactive/primary', stroke: 'brand/black' },
  light: { track: 'fill/inactive/primary', stroke: 'fill/inactive/quaternary' },
  primary: { track: 'fill/inactive/primary', stroke: 'fill/active/primary' },
  alert: { track: 'fill/inactive/primary', stroke: 'fill/alert/primary' },
  warning: { track: 'fill/inactive/primary', stroke: 'fill/warning/primary' },
}

function getSpinnerColors(color: SpinnerColor, getColor: (t: ColorToken) => string): SpinnerColors {
  const { track, stroke } = SPINNER_COLOR_TOKENS[color]
  return { track: getColor(track), stroke: getColor(stroke) }
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

/**
 * Vòng loading vẽ bằng react-native-svg (strokeDasharray/strokeDashoffset) thay vì
 * @shopify/react-native-skia. Chạy giống hệt trên iOS/Android/Web, không cần tải
 * canvaskit.wasm (~8MB) trên web — xem CHANGELOG.md để biết lý do đổi.
 */
const MySpinner: React.FC<MySpinnerProps> = ({
  color = 'dark',
  size: sizeProp = 'default',
  style,
  ...rest
}) => {
  const { getColor } = useTheme()
  const { size, strokeWidth } = useMemo(() => getSpinnerSize(sizeProp), [sizeProp])
  const { track, stroke } = useMemo(
    () => getSpinnerColors(color, getColor as (t: ColorToken) => string),
    [color, getColor],
  )

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const process = useSharedValue(0.1)
  const rotation = useSharedValue(0)

  const startAnimation = useCallback(() => {
    process.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 1000 }), withTiming(0.1, { duration: 2000 })),
      -1,
      true,
    )
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false,
    )
  }, [process, rotation])

  useEffect(() => {
    startAnimation()
    return () => {
      process.value = 0.1
      rotation.value = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAnimation])

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - process.value),
  }))

  const boxStyle = useMemo(() => ({ width: size, height: size }), [size])

  if (size <= 0) return null

  return (
    <MyView {...rest} style={style}>
      <Animated.View style={[styles.spinner, boxStyle, rotateStyle]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={track}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={arcProps}
          />
        </Svg>
      </Animated.View>
    </MyView>
  )
}

MySpinner.displayName = 'MySpinner'

export default React.memo(MySpinner)
