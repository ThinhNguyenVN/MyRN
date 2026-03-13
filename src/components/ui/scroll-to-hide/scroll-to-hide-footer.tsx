import React from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

import { useScrollToHide } from './context'

import type { ScrollToHideFooterProps } from './types'
import { useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from './styles'

export function ScrollToHideFooter({ children, style }: ScrollToHideFooterProps) {
  const ctx = useScrollToHide()
  const fallbackProgress = useSharedValue(0)
  const hideProgress = ctx?.hideProgress ?? fallbackProgress
  const measuredFooterHeight = ctx?.measuredFooterHeight
  const styles = useThemedStyles(generateStyles)

  const animatedStyle = useAnimatedStyle(() => {
    'worklet'
    const p = hideProgress.value
    const h = measuredFooterHeight?.value ?? 0
    return {
      opacity: 1 - p,
      transform: [{ translateY: p * h }],
    }
  }, [hideProgress, measuredFooterHeight])

  const handleLayout = React.useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) => {
      const h = e.nativeEvent.layout.height
      if (h > 0) ctx?.setMeasuredFooterHeight?.(h)
    },
    [ctx],
  )

  return (
    <Animated.View style={[styles.footer, animatedStyle, style]}>
      <View onLayout={handleLayout} collapsable={false}>
        {children}
      </View>
    </Animated.View>
  )
}
