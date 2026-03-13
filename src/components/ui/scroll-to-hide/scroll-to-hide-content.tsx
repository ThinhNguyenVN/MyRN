import React, { cloneElement, isValidElement, useEffect } from 'react'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import { useScrollToHide } from './context'
import type { ScrollToHideContentProps } from './types'
import { useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from './styles'

export function ScrollToHideContent({
  children,
  scrollEventThrottle = 16,
}: ScrollToHideContentProps) {
  const styles = useThemedStyles(generateStyles)
  const ctx = useScrollToHide()
  if (ctx && isValidElement(children)) {
    ctx.childOnScrollRef.current = (children as React.ReactElement<any>).props?.onScroll
  }

  useEffect(() => {
    ctx?.register()
    return () => ctx?.unregister()
  }, [ctx])

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
        onScroll: ctx.animatedScrollHandler,
        scrollEventThrottle,
      })}
    </Animated.View>
  )
}
