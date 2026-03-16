import React, { useEffect, useMemo, useRef } from 'react'
import { Circle, Path, Svg } from 'react-native-svg'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { useTheme, useThemedStyles } from '@/theme/theme-context'
import type { RefreshIndicatorProps } from './types'
import { generateStyles } from './styles'

const SPINNER_SIZE = 32
const STROKE_WIDTH = 3
const RADIUS = (SPINNER_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const CHECK_PATH = 'M 8 17 L 14 23 L 24 10'
const CHECK_LENGTH = 25

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)

export function RefreshIndicator({
  pullDistance,
  refreshing,
  threshold = 75,
}: RefreshIndicatorProps) {
  const { getColor } = useTheme()
  const styles = useThemedStyles(generateStyles)
  const trackColor = getColor('fill/inactive/primary')
  const strokeColor = getColor('fill/active/primary')

  const prevRefreshing = useRef(false)

  const process = useSharedValue(0)
  const rotation = useSharedValue(0)
  const isRefreshing = useSharedValue(0)
  const isDone = useSharedValue(0)
  const spinnerFade = useSharedValue(1)

  const checkDraw = useSharedValue(0)
  const checkOpacity = useSharedValue(0)

  useEffect(() => {
    const wasRefreshing = prevRefreshing.current
    prevRefreshing.current = refreshing

    if (refreshing) {
      isRefreshing.value = 1
      isDone.value = 0
      spinnerFade.value = 1
      checkDraw.value = 0
      checkOpacity.value = 0

      process.value = withRepeat(
        withSequence(
          withTiming(0.75, { duration: 600, easing: Easing.out(Easing.ease) }),
          withTiming(0.1, { duration: 800, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      )
      rotation.value = withRepeat(
        withTiming(360, { duration: 800, easing: Easing.linear }),
        -1,
        false,
      )
    } else if (wasRefreshing) {
      isDone.value = 1
      isRefreshing.value = 0
      cancelAnimation(process)

      rotation.value = withTiming(rotation.value + 180, {
        duration: 350,
        easing: Easing.out(Easing.ease),
      })
      process.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) })

      spinnerFade.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 50 }),
      )

      checkOpacity.value = withSequence(
        withTiming(0, { duration: 150 }),
        withTiming(1, { duration: 50 }),
        withTiming(1, { duration: 450 }),
        withTiming(0, { duration: 200 }),
      )
      checkDraw.value = withSequence(
        withTiming(0, { duration: 150 }),
        withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) }),
      )

      setTimeout(() => {
        isDone.value = 0
        checkDraw.value = 0
        checkOpacity.value = 0
      }, 900)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing])

  useAnimatedReaction(
    () => pullDistance.value,
    (dist, prev) => {
      if (isRefreshing.value === 1 || isDone.value === 1) return
      if (dist > 0 && (prev ?? 0) <= 0) {
        spinnerFade.value = 1
      }
      const phase = Math.min(1, Math.max(0, dist / threshold))
      process.value = phase * 0.85
      rotation.value = phase * 720
    },
  )

  const containerStyle = useAnimatedStyle(() => ({
    height: pullDistance.value,
  }))

  const spinnerStyle = useAnimatedStyle(() => {
    const phase = Math.min(1, Math.max(0, pullDistance.value / threshold))
    return {
      opacity: Math.min(1, pullDistance.value / (threshold * 0.4)) * spinnerFade.value,
      transform: [{ scale: 0.3 + phase * 0.7 }, { rotate: `${rotation.value}deg` }],
    }
  })

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }))

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - process.value),
  }))

  const checkPathProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - checkDraw.value),
  }))

  const svgSize = useMemo(() => ({ width: SPINNER_SIZE, height: SPINNER_SIZE }), [])

  return (
    <Animated.View style={[styles.indicatorContainer, containerStyle]} pointerEvents="none">
      <Animated.View style={[styles.iconBox, spinnerStyle]}>
        <Svg {...svgSize}>
          <Circle
            cx={SPINNER_SIZE / 2}
            cy={SPINNER_SIZE / 2}
            r={RADIUS}
            stroke={trackColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
          />
          <AnimatedCircle
            cx={SPINNER_SIZE / 2}
            cy={SPINNER_SIZE / 2}
            r={RADIUS}
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={arcProps}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.iconBox, styles.checkAbsolute, checkStyle]}>
        <Svg {...svgSize}>
          <AnimatedPath
            d={CHECK_PATH}
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${CHECK_LENGTH} ${CHECK_LENGTH}`}
            animatedProps={checkPathProps}
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  )
}
