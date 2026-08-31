import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Pressable, StyleSheet, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { isWeb } from '@/constants/dimensions'
import { useTheme } from '@/theme/theme-context'
import { triggerHaptic } from '@/utils/haptic'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import type { MyPressableEvent, MyPressableProps } from './type'

export const SCALE_LARGE = 0.985
export const SCALE_SMALL = 0.95
const SIZE_THRESHOLD = 64
const SPRING_CONFIG = { damping: 20, stiffness: 200 }
const TIMING_DURATION = 100
const OPACITY_PRESSED = 0.8
const OPACITY_IDLE = 1
const MULTI_PRESS_BLOCK_MS = 600
/** Reused instead of an inline literal so both style arrays below share one object identity. */
const VISIBLE_OVERFLOW_STYLE = { overflow: 'visible' as const }

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
  preventMultiPress = true,
  style,
  surfaceProps,
  ...rest
}) => {
  const { hapticEnabled } = useTheme()
  const haptic = hapticProp ?? hapticEnabled
  const lastPressAtRef = useRef(0)
  // A recycled list cell (FlashList) can reuse this same component instance for a different
  // row without unmounting it — reset the throttle so that row's first tap isn't swallowed by
  // a leftover timestamp from whatever row this instance rendered before.
  const lastOnPressRef = useRef(onPress)
  if (lastOnPressRef.current !== onPress) {
    lastOnPressRef.current = onPress
    lastPressAtRef.current = 0
  }
  // `rest` is a fresh object every render (object-rest destructuring), so a useMemo keyed on
  // it would never hit its cache — plain computation avoids paying for that bookkeeping.
  const containerStyle = getContainerStyle(
    pickContainerProps(rest as Record<string, unknown>) as Parameters<typeof getContainerStyle>[0],
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
    if (animatedType === 'scale') {
      handlePressInScale()
    } else {
      handlePressInOpacity()
    }
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
    if (animatedType === 'scale') {
      handlePressOutScale()
    } else {
      handlePressOutOpacity()
    }
  }, [disabled, animatedType, handlePressOutOpacity, handlePressOutScale, onPressOutProp])

  // Match React Navigation PlatformPressable: href → <a> on web; preventDefault for SPA nav.
  const handlePress = useCallback(
    (e: MyPressableEvent) => {
      if (disabled) return

      const firePress = () => {
        if (preventMultiPress) {
          const now = Date.now()
          if (now - lastPressAtRef.current < MULTI_PRESS_BLOCK_MS) {
            return
          }
          lastPressAtRef.current = now
        }
        onPress?.(e)
      }

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
          firePress()
        }
        return
      }
      firePress()
    },
    [disabled, href, onPress, preventMultiPress],
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
      style={[...(hasContainerStyle ? [containerStyle] : []), style, VISIBLE_OVERFLOW_STYLE]}
    >
      <Animated.View style={[innerLayoutStyle, VISIBLE_OVERFLOW_STYLE, animatedStyle]}>
        {content}
      </Animated.View>
    </Pressable>
  )
}

MyPressable.displayName = 'MyPressable'

export default memo(MyPressable)
