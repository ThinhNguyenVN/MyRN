import React, { memo } from 'react'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { useScrollToHide } from './context'
import { generateStyles } from './styles'
import type { ScrollToHideInsetProps } from './types'

/** Animated top/bottom inset for absolute scroll-to-hide chrome (no scroll registration). */
function ScrollToHideInsetInner({ children, style }: ScrollToHideInsetProps) {
  const styles = useThemedStyles(generateStyles)
  const ctx = useScrollToHide()
  const hideProgress = ctx?.hideProgress
  const measuredHeaderHeight = ctx?.measuredHeaderHeight
  const measuredFooterHeight = ctx?.measuredFooterHeight

  const animatedPaddingStyle = useAnimatedStyle(() => {
    'worklet'
    if (!hideProgress) {
      return { paddingTop: 0, paddingBottom: 0 }
    }
    const p = hideProgress.value
    return {
      paddingTop: (measuredHeaderHeight?.value ?? 0) * (1 - p),
      paddingBottom: (measuredFooterHeight?.value ?? 0) * (1 - p),
    }
  }, [hideProgress, measuredHeaderHeight, measuredFooterHeight])

  if (!ctx) {
    return <MyView style={[styles.content, style]}>{children}</MyView>
  }

  return (
    <Animated.View style={[styles.content, animatedPaddingStyle, style]}>{children}</Animated.View>
  )
}

export const ScrollToHideInset = memo(ScrollToHideInsetInner)
