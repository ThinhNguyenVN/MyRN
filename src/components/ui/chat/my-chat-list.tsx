import React, { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import {
  Keyboard,
  type GestureResponderEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native'
import { FlashList, type FlashListRef, type ListRenderItemInfo } from '@shopify/flash-list'

import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import type { RenderCustomMessage } from './chat-adapter'
import { useKeyboardScrollAnchor } from './hooks'
import MyChatBubble from './my-chat-bubble'
import { generateStyles } from './styles'
import type { ChatFormValues, ChatMessage, MessageAction } from './types'

/** Distance (px) from the real bottom still considered "at bottom" for keyboard anchoring. */
const BOTTOM_ANCHOR_THRESHOLD = 24
/** Touch travel (px) under which a gesture still counts as a tap, not a scroll. */
const TAP_SLOP = 8

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
}: MyChatListProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
  const listRef = useRef<FlashListRef<ChatMessage>>(null)
  const lastScrollTokenRef = useRef(0)
  const isAtBottomRef = useRef(true)
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
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height)
    isAtBottomRef.current = distanceFromBottom <= BOTTOM_ANCHOR_THRESHOLD
    didScrollDuringTouchRef.current = true
  }, [])

  const handleScrollToEndForKeyboard = useCallback(() => {
    // Animated (not a hard snap): the keyboard transition itself already settled by
    // the time `onEnd` fires, so an instant scrollToEnd here reads as an abrupt extra
    // jump right after the smooth marginBottom animation. Easing this correction in
    // makes it read as a continuation of that same motion instead of a second, jarring
    // one.
    listRef.current?.scrollToEnd({ animated: true })
  }, [])

  useKeyboardScrollAnchor(handleScrollToEndForKeyboard, isAtBottomRef)

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
  )
}

export default memo(MyChatList)
