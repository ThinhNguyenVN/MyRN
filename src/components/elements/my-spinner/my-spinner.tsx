import React, { memo, useCallback, useEffect, useMemo } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Canvas, Path, Skia } from '@shopify/react-native-skia'

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

/** Chỉ mount Canvas sau onLayout để tránh Skia render trước khi layout sẵn sàng. */
const CanvasSafe: React.FC<{ size: number; children: React.ReactNode }> = memo(
  ({ size, children }) => {
    const [ready, setReady] = React.useState(false)
    const hasLayoutRef = React.useRef(false)
    const onLayout = React.useCallback(() => {
      if (hasLayoutRef.current) return
      hasLayoutRef.current = true
      setReady(true)
    }, [])
    return (
      <MyView style={{ width: size, height: size }} onLayout={onLayout}>
        {ready ? children : null}
      </MyView>
    )
  },
)
CanvasSafe.displayName = 'CanvasSafe'

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

  const mountedRef = React.useRef(true)

  const path = useMemo(() => {
    const p = Skia.Path.Make()
    const r = (size - strokeWidth) / 2
    p.addCircle(size / 2, size / 2, r)
    return p
  }, [size, strokeWidth])

  const process = useSharedValue(0)
  const rotation = useSharedValue(0)

  const startAnimation = useCallback(() => {
    if (!mountedRef.current) return
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
    mountedRef.current = true
    startAnimation()
    return () => {
      mountedRef.current = false
      process.value = 0
      rotation.value = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAnimation])

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }),
    [],
  )

  if (size <= 0) return null

  return (
    <MyView {...rest} style={style}>
      <Animated.View
        style={[
          styles.spinner,
          { borderRadius: size / 2, width: size, height: size },
          animatedStyle,
        ]}
      >
        <CanvasSafe size={size}>
          <Canvas style={{ width: size, height: size }}>
            <Path
              path={path}
              strokeWidth={strokeWidth}
              style="stroke"
              color={track}
              strokeJoin="round"
              strokeCap="round"
              start={0}
              end={1}
            />
            <Path
              path={path}
              strokeWidth={strokeWidth}
              style="stroke"
              color={stroke}
              strokeJoin="round"
              strokeCap="round"
              start={0}
              end={process}
            />
          </Canvas>
        </CanvasSafe>
      </Animated.View>
    </MyView>
  )
}

MySpinner.displayName = 'MySpinner'

export default memo(MySpinner)
