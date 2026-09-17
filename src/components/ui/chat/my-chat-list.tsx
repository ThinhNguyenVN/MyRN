import React, { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FlashList, type FlashListRef, type ListRenderItemInfo } from '@shopify/flash-list'
import { StyleSheet } from 'react-native'
import { useKeyboardHandler } from 'react-native-keyboard-controller'
import { runOnJS } from 'react-native-reanimated'

import { isWeb } from '@/constants/dimensions'
import { useThemedStyles } from '@/theme/theme-context'

import type { RenderCustomMessage } from './chat-adapter'
import MyChatBubble from './my-chat-bubble'
import { generateStyles } from './styles'
import type { ChatFormValues, ChatMessage, MessageAction } from './types'

export interface MyChatListProps {
  messages: ChatMessage[]
  onSelectOption: (messageId: string, optionId: string) => void
  onConfirm: (messageId: string, confirmed: boolean) => void
  onSubmitForm: (messageId: string, values: ChatFormValues) => void
  onRetry: (messageId: string) => void
  onAction: (action: MessageAction) => void
  renderCustomMessage?: RenderCustomMessage
  scrollToEndToken?: number
}

function keyExtractor(item: ChatMessage): string {
  return `chat-message-${item.id}`
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
}: MyChatListProps) {
  const styles = useThemedStyles(generateStyles)
  const listRef = useRef<FlashListRef<ChatMessage>>(null)
  const lastScrollTokenRef = useRef(0)
  const previousTopInsetRef = useRef(0)
  const [topScrollInset, setTopScrollInset] = useState(0)

  const applyTopScrollInset = useCallback((next: number) => {
    setTopScrollInset((current) => (current === next ? current : next))
  }, [])

  useKeyboardHandler(
    {
      onStart: (event) => {
        'worklet'
        if (isWeb) {
          return
        }
        // Destination is closed: drop inset before translateY animates back.
        if (event.progress === 0) {
          runOnJS(applyTopScrollInset)(0)
        }
      },
      onEnd: (event) => {
        'worklet'
        if (isWeb) {
          return
        }
        runOnJS(applyTopScrollInset)(event.progress === 1 ? event.height : 0)
      },
    },
    [applyTopScrollInset],
  )

  const listContentStyle = useMemo(() => {
    const basePaddingTop = StyleSheet.flatten(styles.listContent).paddingTop
    const paddingTop = (typeof basePaddingTop === 'number' ? basePaddingTop : 0) + topScrollInset
    return [styles.listContent, { paddingTop }]
  }, [styles.listContent, topScrollInset])

  useLayoutEffect(() => {
    const previous = previousTopInsetRef.current
    previousTopInsetRef.current = topScrollInset
    const delta = topScrollInset - previous
    const list = listRef.current
    if (!list || delta === 0) {
      return
    }
    list.scrollToOffset({
      offset: Math.max(0, list.getAbsoluteLastScrollOffset() + delta),
      animated: false,
    })
  }, [topScrollInset])

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

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => (
      <MyChatBubble
        message={item}
        onSelectOption={onSelectOption}
        onConfirm={onConfirm}
        onSubmitForm={onSubmitForm}
        onRetry={onRetry}
        onAction={onAction}
        renderCustomMessage={renderCustomMessage}
      />
    ),
    [onSelectOption, onConfirm, onSubmitForm, onRetry, onAction, renderCustomMessage],
  )

  return (
    <FlashList
      ref={listRef}
      data={messages}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={listContentStyle}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0.2,
        animateAutoScrollToBottom: false,
      }}
    />
  )
}

export default memo(MyChatList)
