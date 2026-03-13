import React from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

import { useScrollToHide } from './context'

import type { ScrollToHideHeaderProps } from './types'
import { useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from './styles'
export function ScrollToHideHeader({ children, style }: ScrollToHideHeaderProps) {
  const styles = useThemedStyles(generateStyles)
  const ctx = useScrollToHide()
  const fallbackProgress = useSharedValue(0)
  const hideProgress = ctx?.hideProgress ?? fallbackProgress
  const measuredHeaderHeight = ctx?.measuredHeaderHeight

  const animatedStyle = useAnimatedStyle(() => {
    'worklet'
    const p = hideProgress.value
    const h = measuredHeaderHeight?.value ?? 0
    return {
      opacity: 1 - p,
      transform: [{ translateY: -p * h }],
    }
  }, [hideProgress, measuredHeaderHeight])

  const handleLayout = React.useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) => {
      const h = e.nativeEvent.layout.height
      if (h > 0) ctx?.setMeasuredHeaderHeight?.(h)
    },
    [ctx],
  )

  return (
    <Animated.View style={[styles.header, animatedStyle, style]}>
      <View onLayout={handleLayout} collapsable={false}>
        {children}
      </View>
    </Animated.View>
  )
}
