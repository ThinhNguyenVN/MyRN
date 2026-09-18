import React, { memo, useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { FlashList, type FlashListRef, type ListRenderItemInfo } from '@shopify/flash-list'

import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

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
  columnGutter: number
  composerHeight: number
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
  columnGutter,
  composerHeight,
}: MyChatListProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
  const listRef = useRef<FlashListRef<ChatMessage>>(null)
  const lastScrollTokenRef = useRef(0)
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
    [itemStyle, onSelectOption, onConfirm, onSubmitForm, onRetry, onAction, renderCustomMessage],
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
