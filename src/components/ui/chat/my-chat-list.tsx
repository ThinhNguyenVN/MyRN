import React, { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import {
  Keyboard,
  type GestureResponderEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { FlashList, type FlashListRef, type ListRenderItemInfo } from '@shopify/flash-list'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { isAndroid } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import type { RenderCustomMessage } from './chat-adapter'
import { BOTTOM_ANCHOR_THRESHOLD, KEYBOARD_CLOSE_SCROLL_SLACK, TAP_SLOP } from './constants'
import MyChatBubble from './my-chat-bubble'
import { generateStyles } from './styles'
import type { ChatFormValues, ChatMessage, MessageAction } from './types'
import { useKeyboardScrollAnchor } from './use-keyboard-scroll-anchor'

export interface MyChatListProps {
  messages: ChatMessage[]
  onSelectOption: (messageId: string, optionId: string) => void
  onConfirm: (messageId: string, confirmed: boolean) => void
  onSubmitForm: (messageId: string, values: ChatFormValues) => void
  onRetry: (messageId: string) => void
  onAction: (action: MessageAction) => void
  renderCustomMessage?: RenderCustomMessage
  scrollToEndToken?: number
  columnGutter: number
  composerHeight: number
  /** Focus state of the composer input, so we only dismiss the keyboard it owns. */
  isComposerFocusedRef?: { current: boolean }
  /**
   * Keyboard height shared value, owned by MyChat's single screen-lifetime
   * `useReanimatedKeyboardAnimation()`. Passed in rather than read again here: that hook
   * also calls `useResizeMode()`, whose unmount resets Android's soft-input mode
   * globally, and this component unmounts whenever `hasMessages` flips.
   */
  keyboardHeight: SharedValue<number>
}

function keyExtractor(item: ChatMessage): string {
  return `chat-message-${item.id}`
}

function ChatListItemSeparator() {
  const styles = useThemedStyles(generateStyles)
  return <MyView style={styles.listItemSeparator} />
}

function MyChatList({
  messages,
  onSelectOption,
  onConfirm,
  onSubmitForm,
  onRetry,
  onAction,
  renderCustomMessage,
  scrollToEndToken = 0,
  columnGutter,
  composerHeight,
  isComposerFocusedRef,
  keyboardHeight,
}: MyChatListProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
  const listRef = useRef<FlashListRef<ChatMessage>>(null)
  const lastScrollTokenRef = useRef(0)
  const isAtBottomRef = useRef(true)
  const keyboardMotionLockRef = useRef(false)
  /** Android: keyboard space (px) currently reserved by the list's layout. */
  const keyboardSpace = useSharedValue(0)
  const reservedKeyboardSpaceRef = useRef(0)
  const touchStartYRef = useRef(0)
  const didScrollDuringTouchRef = useRef(false)
  const itemStyle = useMemo(
    () => [styles.listItem, { paddingHorizontal: columnGutter }],
    [columnGutter, styles.listItem],
  )
  const listContentStyle = useMemo(() => {
    if (composerHeight <= 0) {
      return styles.listContent
    }
    return [styles.listContent, { paddingBottom: composerHeight + getSpacing('x4') }]
  }, [composerHeight, getSpacing, styles.listContent])

  useLayoutEffect(() => {
    if (scrollToEndToken === 0 || scrollToEndToken === lastScrollTokenRef.current) {
      return
    }
    lastScrollTokenRef.current = scrollToEndToken
    if (messages.length <= 1) {
      return
    }
    listRef.current?.scrollToEnd({ animated: false })
  }, [messages.length, scrollToEndToken])

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    didScrollDuringTouchRef.current = true
    if (keyboardMotionLockRef.current) {
      return
    }
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height)
    isAtBottomRef.current = distanceFromBottom <= BOTTOM_ANCHOR_THRESHOLD
  }, [])

  const handleScrollToEndForKeyboard = useCallback(() => {
    const pinToEnd = () => {
      listRef.current?.scrollToEnd({ animated: false })
    }
    pinToEnd()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        pinToEnd()
        if (!isAndroid) {
          return
        }
        const settledOffset = listRef.current?.getAbsoluteLastScrollOffset() ?? 0
        listRef.current?.scrollToOffset({
          offset: settledOffset + KEYBOARD_CLOSE_SCROLL_SLACK,
          animated: false,
        })
      })
    })
  }, [])

  /**
   * Android: move the scroll by exactly the change in reserved keyboard space, at the
   * START of the transition, while the counter-transform hides it. At the bottom we pin
   * to the true end (which is what reaches the last bit of bottom padding — the reason a
   * pin is needed at all); elsewhere we shift by the delta so the viewport is preserved
   * mid-list too. Either way the shift is ~the same amount the transform cancels, so
   * nothing appears to move until the keyboard itself starts moving.
   */
  // This component mounts when `hasMessages` flips — which, in the most common flow,
  // happens while the keyboard is already open (sending the first message). There is no
  // transition to hook in that case, so seed the reserved space from the current keyboard
  // height instead of waiting for the next open/close. Layout effect, so the first paint
  // already has it.
  useLayoutEffect(() => {
    if (!isAndroid) {
      return
    }
    const openHeight = Math.max(0, -keyboardHeight.value)
    keyboardSpace.value = openHeight
    reservedKeyboardSpaceRef.current = openHeight
  }, [keyboardHeight, keyboardSpace])

  const shiftScrollForKeyboard = useCallback(
    (destinationKeyboardHeight: number) => {
      const delta = destinationKeyboardHeight - reservedKeyboardSpaceRef.current
      reservedKeyboardSpaceRef.current = destinationKeyboardHeight
      if (delta === 0) {
        return
      }
      if (isAtBottomRef.current) {
        handleScrollToEndForKeyboard()
        return
      }
      const current = listRef.current?.getAbsoluteLastScrollOffset() ?? 0
      listRef.current?.scrollToOffset({ offset: current + delta, animated: false })
    },
    [handleScrollToEndForKeyboard],
  )

  useKeyboardScrollAnchor(
    handleScrollToEndForKeyboard,
    isAtBottomRef,
    keyboardMotionLockRef,
    keyboardSpace,
    shiftScrollForKeyboard,
  )

  /**
   * Android only. `marginBottom` is the real, steady-state viewport change — committed
   * ONCE per transition (in the worklet that starts it), never per frame: animating it
   * per frame was the jank, because every frame was a Yoga re-layout plus a FlashList
   * re-measure. `translateY` is the mask: it starts out cancelling both the layout commit
   * and the scroll shift, then unwinds to 0 as the keyboard moves — paint-only, so the
   * per-frame cost is a composite, not a layout. `keyboardHeight` is negative while the
   * keyboard is open, so `keyboardSpace + keyboardHeight` is 0 at both rest states.
   */
  const keyboardShiftStyle = useAnimatedStyle(() => {
    if (!isAndroid) {
      return {}
    }
    return {
      marginBottom: keyboardSpace.value,
      transform: [{ translateY: keyboardSpace.value + keyboardHeight.value }],
    }
  })

  const handleTouchStart = useCallback((event: GestureResponderEvent) => {
    touchStartYRef.current = event.nativeEvent.pageY
    didScrollDuringTouchRef.current = false
  }, [])

  const handleTouchEnd = useCallback(
    (event: GestureResponderEvent) => {
      const travelled = Math.abs(event.nativeEvent.pageY - touchStartYRef.current)
      const isTap = !didScrollDuringTouchRef.current && travelled <= TAP_SLOP
      if (isTap && isComposerFocusedRef?.current) {
        Keyboard.dismiss()
      }
    },
    [isComposerFocusedRef],
  )

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => (
      <MyView style={itemStyle}>
        <MyChatBubble
          message={item}
          onSelectOption={onSelectOption}
          onConfirm={onConfirm}
          onSubmitForm={onSubmitForm}
          onRetry={onRetry}
          onAction={onAction}
          renderCustomMessage={renderCustomMessage}
        />
      </MyView>
    ),
    [onSelectOption, onConfirm, onSubmitForm, onRetry, onAction, renderCustomMessage, itemStyle],
  )

  return (
    <Animated.View style={[styles.keyboardShiftWrapper, keyboardShiftStyle]}>
      <FlashList
        ref={listRef}
        data={messages}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={ChatListItemSeparator}
        style={styles.list}
        contentContainerStyle={listContentStyle}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        maintainVisibleContentPosition={{
          startRenderingFromBottom: true,
          autoscrollToBottomThreshold: 0.2,
          animateAutoScrollToBottom: false,
        }}
      />
    </Animated.View>
  )
}

export default memo(MyChatList)
