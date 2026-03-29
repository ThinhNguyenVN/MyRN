import React, { memo } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'

import MyButton from '@/components/elements/my-button'
import { BUTTON_SMALL_HEIGHT } from '@/components/elements/my-button/styles'

import { SCALE_MIN, SCALE_RANGE, SLOT_STEP, UNDERLAY_PADDING_X } from './constants'
import type { StaggeredIconScaleProps, SwipeableItemAction, SwipeStripSide } from './types'

interface SwipeableActionStripProps {
  actions: SwipeableItemAction[]
  side: SwipeStripSide
  rowKey: string
  stripPx: number
  stripStyle: StyleProp<ViewStyle>
  translateX: SharedValue<number>
  wrapAction: (fn: () => void) => void
}

const StaggeredIconScale = memo(function StaggeredIconScale({
  translateX,
  side,
  staggerIndex,
  children,
}: StaggeredIconScaleProps) {
  const style = useAnimatedStyle(() => {
    const x = translateX.value
    const reveal = side === 'left' ? Math.max(0, x) : Math.max(0, -x)
    const start = UNDERLAY_PADDING_X + staggerIndex * SLOT_STEP
    const end = start + BUTTON_SMALL_HEIGHT
    const p = interpolate(reveal, [start, end], [0, 1], Extrapolation.CLAMP)
    const s = SCALE_MIN + SCALE_RANGE * p
    return { transform: [{ scale: s }] }
  }, [side, staggerIndex])

  return (
    <Animated.View style={style} collapsable={false}>
      {children}
    </Animated.View>
  )
})

StaggeredIconScale.displayName = 'StaggeredIconScale'

export function SwipeableActionStrip({
  actions,
  side,
  rowKey,
  stripPx,
  stripStyle,
  translateX,
  wrapAction,
}: SwipeableActionStripProps) {
  if (stripPx <= 0) return null
  const prefix = side === 'left' ? 'l' : 'r'

  return (
    <View style={[stripStyle, { width: stripPx }]} pointerEvents="box-none">
      {actions.map((a, i) => (
        <StaggeredIconScale
          key={`${prefix}-${rowKey}-${i}`}
          translateX={translateX}
          side={side}
          staggerIndex={side === 'left' ? i : actions.length - 1 - i}
        >
          <MyButton.Icon
            size="small"
            icon={a.icon}
            type={a.type ?? 'secondary'}
            animatedType="opacity"
            onPress={() => wrapAction(a.onPress)}
          />
        </StaggeredIconScale>
      ))}
    </View>
  )
}
