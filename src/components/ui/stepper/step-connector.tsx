import { memo, useCallback, useEffect } from 'react'
import { type LayoutChangeEvent } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { PROGRESS_MS } from './constants'
import { generateStyles } from './styles'
import type { StepConnectorProps } from './type'

function StepConnectorComponent({ filled, style }: StepConnectorProps) {
  const styles = useThemedStyles(generateStyles)
  const trackWidth = useSharedValue(0)
  const progress = useSharedValue(filled ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(filled ? 1 : 0, {
      duration: PROGRESS_MS,
      easing: Easing.out(Easing.cubic),
    })
  }, [filled, progress])

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      trackWidth.value = event.nativeEvent.layout.width
    },
    [trackWidth],
  )

  const fillStyle = useAnimatedStyle(() => ({
    width: trackWidth.value * progress.value,
  }))

  return (
    <MyView style={[styles.connector, style]} pointerEvents="none" onLayout={handleLayout}>
      <Animated.View style={[styles.connectorFill, fillStyle]} />
    </MyView>
  )
}

export const StepConnector = memo(StepConnectorComponent)
