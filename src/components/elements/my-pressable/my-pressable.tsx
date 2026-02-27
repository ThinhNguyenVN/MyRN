import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { triggerHaptic } from './haptic'

import MySurface from '@/components/elements/my-surface'
import { useThemedStyles } from '@/theme/theme-context'

import type { AnimatedType, MyPressableProps } from './type'
import { generateStyles } from './styles'
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
  disabled = false,
  scaleValue = SCALE_LARGE,
  scaleBySize = true,
  animatedType = 'scale',
  haptic = true,
  style,
  surfaceProps,
  ...rest
}) => {
  const styles = useThemedStyles(generateStyles)
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
  }, [disabled, animatedType, haptic, handlePressInOpacity, handlePressInScale])

  const handlePressOutScale = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG)
    opacity.value = 1
  }, [opacity, scale])

  const handlePressOutOpacity = useCallback(() => {
    scale.value = 1
    opacity.value = withTiming(OPACITY_IDLE, { duration: TIMING_DURATION })
  }, [opacity, scale])

  const handlePressOut = useCallback(() => {
    if (disabled) return
    const handlers: Record<AnimatedType, () => void> = {
      scale: handlePressOutScale,
      opacity: handlePressOutOpacity,
    }
    handlers[animatedType]()
  }, [disabled, animatedType, handlePressOutOpacity, handlePressOutScale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const content = surfaceProps ? <MySurface {...surfaceProps}>{children}</MySurface> : children

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={scaleBySize ? onLayout : undefined}
      disabled={disabled}
      style={[styles.wrapper, ...(hasContainerStyle ? [containerStyle] : []), style]}
    >
      <Animated.View style={animatedStyle}>{content}</Animated.View>
    </Pressable>
  )
}

MyPressable.displayName = 'MyPressable'

export default memo(MyPressable)
