import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Pressable, StyleSheet, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { isWeb } from '@/constants/dimensions'
import { useTheme } from '@/theme/theme-context'
import { triggerHaptic } from '@/utils/haptic'

import MyView from '@/components/elements/my-view'

import type { AnimatedType, MyPressableEvent, MyPressableProps } from './type'

import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

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
  haptic: hapticProp,
  style,
  surfaceProps,
  ...rest
}) => {
  const { hapticEnabled } = useTheme()
  const haptic = hapticProp ?? hapticEnabled
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
  const pressableProps = omitContainerProps(rest as Record<string, unknown>)
  const href = (pressableProps as { href?: string | null }).href
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

  // Match React Navigation PlatformPressable: href → <a> on web; preventDefault for SPA nav.
  const handlePress = useCallback(
    (e: MyPressableEvent) => {
      if (disabled) return
      if (isWeb && typeof href === 'string') {
        const hasModifierKey =
          ('metaKey' in e && e.metaKey) ||
          ('altKey' in e && e.altKey) ||
          ('ctrlKey' in e && e.ctrlKey) ||
          ('shiftKey' in e && e.shiftKey)
        const isLeftClick = !('button' in e) || e.button === undefined || e.button === 0
        const target =
          e.currentTarget && 'target' in e.currentTarget ? e.currentTarget.target : undefined
        const isSelfTarget = [undefined, null, '', 'self'].includes(target as string | null)
        if (!hasModifierKey && isLeftClick && isSelfTarget) {
          e.preventDefault?.()
          onPress?.(e)
        }
        return
      }
      onPress?.(e)
    },
    [disabled, href, onPress],
  )

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    // Scale creates a containing block that otherwise clips tab labels on web.
    overflow: 'visible' as const,
  }))

  const innerLayoutStyle = useMemo(() => {
    const flat = StyleSheet.flatten(style) as Record<string, unknown> | undefined
    if (!flat) return undefined
    const { flexDirection, alignItems, justifyContent, gap, alignSelf, width, flex } = flat
    const hasLayout =
      flexDirection || alignItems || justifyContent || gap || alignSelf || width || flex
    if (hasLayout) {
      return {
        flexDirection,
        alignItems,
        justifyContent,
        gap,
        alignSelf,
        width,
        flex,
      } as ViewStyle
    }
    return undefined
  }, [style])

  const content = surfaceProps ? <MyView {...surfaceProps}>{children}</MyView> : children

  return (
    <Pressable
      {...pressableProps}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLayout={scaleBySize ? onLayout : undefined}
      disabled={disabled}
      style={[...(hasContainerStyle ? [containerStyle] : []), style, { overflow: 'visible' }]}
    >
      <Animated.View style={[innerLayoutStyle, { overflow: 'visible' }, animatedStyle]}>
        {content}
      </Animated.View>
    </Pressable>
  )
}

MyPressable.displayName = 'MyPressable'

export default memo(MyPressable)
