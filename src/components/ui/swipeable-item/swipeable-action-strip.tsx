import { memo, useCallback } from 'react'
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
import type {
  StaggeredIconScaleProps,
  SwipeableActionButtonsProps,
  SwipeableItemAction,
  SwipeStripSide,
} from './types'

interface SwipeableActionStripProps {
  actions: SwipeableItemAction[]
  rowKey: string
  side: SwipeStripSide
  stripPx: number
  stripStyle: StyleProp<ViewStyle>
  translateX: SharedValue<number>
  wrapAction: (fn: () => void) => void
}

/** Scale icon từ SCALE_MIN → 1 theo tiến độ vuốt lộ ra tới đúng "ô" của nó (stagger theo index). */
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

function ActionButton({
  action,
  wrapAction,
}: {
  action: SwipeableItemAction
  wrapAction?: (fn: () => void) => void
}) {
  const handlePress = useCallback(() => {
    if (wrapAction) {
      wrapAction(action.onPress)
      return
    }
    action.onPress()
  }, [action, wrapAction])

  return (
    <MyButton.Icon
      size="small"
      icon={action.icon}
      type={action.type ?? 'secondary'}
      elevation="none"
      animatedType="opacity"
      disabled={action.disabled}
      onPress={handlePress}
      accessibilityLabel={action.accessibilityLabel}
    />
  )
}

export function SwipeableActionStrip({
  actions,
  rowKey,
  side,
  stripPx,
  stripStyle,
  translateX,
  wrapAction,
}: SwipeableActionStripProps) {
  if (stripPx <= 0 || actions.length === 0) {
    return null
  }
  const prefix = side === 'left' ? 'l' : 'r'

  return (
    <View style={[stripStyle, { width: stripPx }]} pointerEvents="box-none">
      {actions.map((action, index) => (
        <StaggeredIconScale
          key={`${prefix}-${rowKey}-${index}`}
          translateX={translateX}
          side={side}
          staggerIndex={side === 'left' ? actions.length - 1 - index : index}
        >
          <ActionButton action={action} wrapAction={wrapAction} />
        </StaggeredIconScale>
      ))}
    </View>
  )
}

export function SwipeableActionButtons({
  actions,
  rowKey,
  wrapAction,
}: SwipeableActionButtonsProps) {
  return (
    <>
      {actions.map((action, index) => (
        <ActionButton key={`action-${rowKey}-${index}`} action={action} wrapAction={wrapAction} />
      ))}
    </>
  )
}

export default memo(SwipeableActionStrip)
