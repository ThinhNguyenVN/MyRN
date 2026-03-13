import React, { cloneElement, isValidElement, useCallback, useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { useScrollToHide } from './context'
import type { ScrollToHideContentProps } from './types'
import { useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from './styles'

const WEB_SCROLL_END_DEBOUNCE_MS = 120

export function ScrollToHideContent({
  children,
  scrollEventThrottle = 16,
}: ScrollToHideContentProps) {
  const styles = useThemedStyles(generateStyles)
  const ctx = useScrollToHide()
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const childOnScrollRef = useRef<((e: any) => void) | undefined>(undefined)
  if (isValidElement(children)) {
    childOnScrollRef.current = (children as React.ReactElement<any>).props?.onScroll
  }

  useEffect(() => {
    ctx?.register()
    return () => {
      ctx?.unregister()
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current)
        scrollEndTimeoutRef.current = null
      }
    }
  }, [ctx])

  const handleScroll = useCallback(
    (e: any) => {
      childOnScrollRef.current?.(e)
      ctx?.scrollHandler(e)
      if (Platform.OS === 'web' && ctx?.scrollEndHandler) {
        if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current)
        scrollEndTimeoutRef.current = setTimeout(() => {
          scrollEndTimeoutRef.current = null
          ctx?.scrollEndHandler?.()
        }, WEB_SCROLL_END_DEBOUNCE_MS)
      }
    },
    [ctx],
  )

  const scrollEndHandler = ctx?.scrollEndHandler
  const scrollEndDragHandler = ctx?.scrollEndDragHandler

  const hideProgress = ctx?.hideProgress
  const measuredHeaderHeight = ctx?.measuredHeaderHeight
  const measuredFooterHeight = ctx?.measuredFooterHeight

  const animatedPaddingStyle = useAnimatedStyle(() => {
    'worklet'
    if (!hideProgress) return { paddingTop: 0, paddingBottom: 0 }
    const p = hideProgress.value
    const top = (measuredHeaderHeight?.value ?? 0) * (1 - p)
    const bottom = (measuredFooterHeight?.value ?? 0) * (1 - p)
    return {
      paddingTop: top,
      paddingBottom: bottom,
    }
  }, [hideProgress, measuredHeaderHeight, measuredFooterHeight])

  if (!ctx || !isValidElement(children)) {
    return <>{children}</>
  }

  return (
    <Animated.View style={[styles.content, animatedPaddingStyle]}>
      {cloneElement(children as React.ReactElement<any>, {
        onScroll: handleScroll,
        onScrollEnd: scrollEndHandler,
        onScrollEndDrag: scrollEndDragHandler,
        onMomentumScrollEnd: scrollEndHandler,
        scrollEventThrottle,
      })}
    </Animated.View>
  )
}
