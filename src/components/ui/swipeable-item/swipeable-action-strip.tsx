import React, { memo, useCallback } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { View } from 'react-native'

import MyButton from '@/components/elements/my-button'

import type { SwipeableActionButtonsProps, SwipeableItemAction } from './types'

interface SwipeableActionStripProps {
  actions: SwipeableItemAction[]
  rowKey: string
  side: 'left' | 'right'
  stripPx: number
  stripStyle: StyleProp<ViewStyle>
  wrapAction: (fn: () => void) => void
}

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
  wrapAction,
}: SwipeableActionStripProps) {
  if (stripPx <= 0 || actions.length === 0) {
    return null
  }
  const prefix = side === 'left' ? 'l' : 'r'

  return (
    <View style={[stripStyle, { width: stripPx }]} pointerEvents="box-none">
      {actions.map((action, index) => (
        <ActionButton
          key={`${prefix}-${rowKey}-${index}`}
          action={action}
          wrapAction={wrapAction}
        />
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
