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

import { isAndroid, isIos } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import type { RefreshIndicatorProps } from './types'
import { generateStyles } from './styles'

/** Must match `./constants` — literals only inside worklets (Reanimated UI thread). */
const ARC_EASE_EXPONENT = 0.88
const ARC_MAX = 0.85
const MAX_PULL_VISUAL_PX = 120
const ARC_FOLLOW_MS = 220
const PULL_DIRECT_DELTA_PX = 8
const REFRESH_HANDOFF_MS = 180
const SPIN_CYCLE_MS = 800

/** UI-thread helpers — keep in-file so Reanimated can compile them as worklets. */
function pullRefreshArcPhaseWorklet(
  pullDistance: number,
  triggerThreshold: number,
  maxVisualPull: number,
): number {
  'worklet'
  const visualThreshold = Math.max(triggerThreshold, maxVisualPull)
  const rawPhase = Math.min(1, Math.max(0, pullDistance / visualThreshold))
  return rawPhase ** ARC_EASE_EXPONENT
}

function pullRefreshArcProgressWorklet(
  pullDistance: number,
  triggerThreshold: number,
  maxVisualPull: number,
): number {
  'worklet'
  return pullRefreshArcPhaseWorklet(pullDistance, triggerThreshold, maxVisualPull) * ARC_MAX
}

const SPINNER_SIZE = 32
const STROKE_WIDTH = 3
const RADIUS = (SPINNER_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const CHECK_PATH = 'M 8 17 L 14 23 L 24 10'
const CHECK_LENGTH = 25
const IOS_INDICATOR_FIXED_OFFSET_PX = 16
const IOS_INDICATOR_MIN_CONTAINER_HEIGHT = SPINNER_SIZE + IOS_INDICATOR_FIXED_OFFSET_PX

/** Android: RefreshControl thu hồi nhanh, pullDistance ≈ 0 — cần giữ slot + giữ check lâu hơn iOS. */
const CHECK_LEAD_MS = isAndroid ? 120 : 150
const CHECK_DRAW_MS = isAndroid ? 380 : 350
const CHECK_HOLD_MS = isAndroid ? 620 : 450
const CHECK_FADE_OUT_MS = isAndroid ? 240 : 200
const DONE_RESET_MS =
  CHECK_LEAD_MS + 50 + CHECK_HOLD_MS + CHECK_FADE_OUT_MS + (isAndroid ? 120 : 60)

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)

export function RefreshIndicator({
  pullDistance,
  refreshing,
  threshold = 75,
  fixedLayoutSlotHeight,
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
      cancelAnimation(process)
      cancelAnimation(rotation)
      isRefreshing.value = 1
      isDone.value = 0
      spinnerFade.value = 1
      checkDraw.value = 0
      checkOpacity.value = 0

      const startRotation = rotation.value
      const startProcess = process.value

      process.value = withSequence(
        withTiming(Math.max(startProcess, ARC_MAX), {
          duration: REFRESH_HANDOFF_MS,
          easing: Easing.out(Easing.cubic),
        }),
        withRepeat(
          withSequence(
            withTiming(0.75, { duration: 600, easing: Easing.out(Easing.ease) }),
            withTiming(0.12, { duration: 800, easing: Easing.in(Easing.ease) }),
          ),
          -1,
          false,
        ),
      )
      rotation.value = withRepeat(
        withTiming(startRotation + 360, {
          duration: SPIN_CYCLE_MS,
          easing: Easing.linear,
        }),
        -1,
        false,
      )
    } else if (wasRefreshing) {
      isDone.value = 1
      isRefreshing.value = 0
      cancelAnimation(process)
      cancelAnimation(rotation)

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
        withTiming(0, { duration: CHECK_LEAD_MS }),
        withTiming(1, { duration: 50 }),
        withTiming(1, { duration: CHECK_HOLD_MS }),
        withTiming(0, { duration: CHECK_FADE_OUT_MS }),
      )
      checkDraw.value = withSequence(
        withTiming(0, { duration: CHECK_LEAD_MS }),
        withTiming(1, { duration: CHECK_DRAW_MS, easing: Easing.out(Easing.ease) }),
      )

      const doneTimer = setTimeout(() => {
        isDone.value = 0
        checkDraw.value = 0
        checkOpacity.value = 0
        cancelAnimation(rotation)
        const r = rotation.value
        rotation.value = ((r % 360) + 360) % 360
        process.value = 0
        spinnerFade.value = 1
      }, DONE_RESET_MS)
      return () => clearTimeout(doneTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing])

  useAnimatedReaction(
    () => pullDistance.value,
    (dist, prev) => {
      // Chỉ chặn khi đang refresh; không chặn isDone — tránh lần kéo sau bị lệch ~900ms.
      if (isRefreshing.value === 1) return
      if (dist > 0 && (prev ?? 0) <= 0) {
        spinnerFade.value = 1
      }
      const targetProcess = pullRefreshArcProgressWorklet(dist, threshold, MAX_PULL_VISUAL_PX)
      const easedPhase = pullRefreshArcPhaseWorklet(dist, threshold, MAX_PULL_VISUAL_PX)
      const targetRotation = easedPhase * 540
      const prevDist = prev ?? 0
      const delta = dist - prevDist

      if (dist > prevDist) {
        if (delta >= PULL_DIRECT_DELTA_PX) {
          process.value = withTiming(targetProcess, {
            duration: ARC_FOLLOW_MS,
            easing: Easing.out(Easing.cubic),
          })
          rotation.value = withTiming(targetRotation, {
            duration: ARC_FOLLOW_MS,
            easing: Easing.out(Easing.cubic),
          })
        } else {
          process.value = targetProcess
          rotation.value = targetRotation
        }
      } else {
        process.value = withTiming(targetProcess, {
          duration: 120,
          easing: Easing.out(Easing.quad),
        })
        rotation.value = withTiming(targetRotation, {
          duration: 120,
          easing: Easing.out(Easing.quad),
        })
      }
    },
  )

  const minHeightRefreshing = 52

  const fixedSlot =
    typeof fixedLayoutSlotHeight === 'number' && fixedLayoutSlotHeight > 0
      ? fixedLayoutSlotHeight
      : 0

  const containerStyle = useAnimatedStyle(() => {
    if (fixedSlot > 0) {
      return { height: fixedSlot }
    }
    const minH = refreshing || isDone.value === 1 ? minHeightRefreshing : 0
    const iosMinH = isIos && pullDistance.value > 0 ? IOS_INDICATOR_MIN_CONTAINER_HEIGHT : 0
    return {
      height: Math.max(pullDistance.value, minH, iosMinH),
    }
  }, [refreshing, fixedSlot])

  const containerPinStyle = useMemo(
    () =>
      isIos
        ? {
            justifyContent: 'flex-start' as const,
            paddingTop: IOS_INDICATOR_FIXED_OFFSET_PX,
          }
        : null,
    [],
  )

  const spinnerStyle = useAnimatedStyle(() => {
    const easedPhase = pullRefreshArcPhaseWorklet(pullDistance.value, threshold, MAX_PULL_VISUAL_PX)
    const isActive = isRefreshing.value === 1 || isDone.value === 1
    const pullOpacity = isActive ? 1 : Math.min(1, easedPhase / 0.88)
    const scale = isAndroid ? 1 : isActive ? 1 : 0.3 + easedPhase * 0.7
    return {
      opacity: pullOpacity * spinnerFade.value,
      transform: [{ scale }, { rotate: `${rotation.value}deg` }],
    }
  }, [threshold])

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }))

  const checkPinStyle = useMemo(
    () =>
      isIos
        ? {
            top: IOS_INDICATOR_FIXED_OFFSET_PX,
            alignSelf: 'center' as const,
          }
        : null,
    [],
  )

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - process.value),
  }))

  const checkPathProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LENGTH * (1 - checkDraw.value),
  }))

  const svgSize = useMemo(() => ({ width: SPINNER_SIZE, height: SPINNER_SIZE }), [])

  return (
    <Animated.View
      style={[styles.indicatorContainer, containerStyle, containerPinStyle]}
      pointerEvents="none"
    >
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

      <Animated.View style={[styles.iconBox, styles.checkAbsolute, checkPinStyle, checkStyle]}>
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
