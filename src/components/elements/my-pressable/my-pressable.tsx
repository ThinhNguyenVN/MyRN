import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { triggerHaptic } from './haptic'

import MyView from '@/components/elements/my-view'

import type { AnimatedType, MyPressableProps } from './type'

import { getContainerStyle, pickContainerProps } from '@/utils/styles'

export const SCALE_LARGE = 0.985
export const SCALE_SMALL = 0.95
const SIZE_THRESHOLD = 64
const SPRING_CONFIG = { damping: 20, stiffness: 200 }
const TIMING_DURATION = 100
const OPACITY_PRESSED = 0.8
const OPACITY_IDLE = 1

const MyPressable: React.FC<MyPressableProps> = ({
  children,
  onPress,
  onPressIn: onPressInProp,
  onPressOut: onPressOutProp,
  disabled = false,
  scaleValue = SCALE_LARGE,
  scaleBySize = true,
  animatedType = 'scale',
  haptic = true,
  style,
  surfaceProps,
  ...rest
}) => {
  const containerStyle = useMemo(
    () =>
      getContainerStyle(
        pickContainerProps(rest as Record<string, unknown>) as Parameters<
          typeof getContainerStyle
        >[0],
      ),
    [rest],
  )
  const hasContainerStyle = Object.keys(containerStyle).length > 0
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)
  const sizeRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    if (animatedType === 'opacity') {
      opacity.value = OPACITY_IDLE
    } else {
      opacity.value = 1
    }
    scale.value = 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animatedType])

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = e.nativeEvent.layout
      sizeRef.current = { w: width, h: height }
    },
    [],
  )

  const handlePressInScale = useCallback(() => {
    opacity.value = 1
    const target = scaleBySize
      ? Math.max(sizeRef.current.w, sizeRef.current.h) >= SIZE_THRESHOLD
        ? SCALE_LARGE
        : SCALE_SMALL
      : scaleValue
    scale.value = withTiming(target, { duration: TIMING_DURATION })
  }, [opacity, scale, scaleValue, scaleBySize])

  const handlePressInOpacity = useCallback(() => {
    scale.value = 1
    opacity.value = withTiming(OPACITY_PRESSED, { duration: TIMING_DURATION })
  }, [opacity, scale])

  const handlePressIn = useCallback(() => {
    if (disabled) return
    const handlers: Record<AnimatedType, () => void> = {
      scale: handlePressInScale,
      opacity: handlePressInOpacity,
    }
    handlers[animatedType]()
    if (haptic) {
      triggerHaptic()
    }
    onPressInProp?.()
  }, [disabled, animatedType, haptic, handlePressInOpacity, handlePressInScale, onPressInProp])

  const handlePressOutScale = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG)
    opacity.value = 1
  }, [opacity, scale])

  const handlePressOutOpacity = useCallback(() => {
    scale.value = 1
    opacity.value = withTiming(OPACITY_IDLE, { duration: TIMING_DURATION })
  }, [opacity, scale])

  const handlePressOut = useCallback(() => {
    onPressOutProp?.()
    if (disabled) return
    const handlers: Record<AnimatedType, () => void> = {
      scale: handlePressOutScale,
      opacity: handlePressOutOpacity,
    }
    handlers[animatedType]()
  }, [disabled, animatedType, handlePressOutOpacity, handlePressOutScale, onPressOutProp])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const innerLayoutStyle = useMemo(() => {
    const flat = StyleSheet.flatten(style)
    if (!flat) return undefined
    const { flexDirection, alignItems, justifyContent, gap } = flat
    if (flexDirection || alignItems || justifyContent || gap) {
      return { flexDirection, alignItems, justifyContent, gap }
    }
    return undefined
  }, [style])

  const content = surfaceProps ? <MyView {...surfaceProps}>{children}</MyView> : children

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={scaleBySize ? onLayout : undefined}
      disabled={disabled}
      style={[...(hasContainerStyle ? [containerStyle] : []), style]}
    >
      <Animated.View style={[innerLayoutStyle, animatedStyle]}>{content}</Animated.View>
    </Pressable>
  )
}

MyPressable.displayName = 'MyPressable'

export default memo(MyPressable)
