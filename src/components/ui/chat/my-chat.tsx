import React, { useCallback, useMemo, useState } from 'react'
import { type LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'

import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { isWeb } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import type { ChatAdapter, RenderCustomMessage } from './chat-adapter'
import { getChatColumnGutter } from './hooks'
import type { ChatSuggestion } from './my-chat-empty-state'
import MyChatEmptyState from './my-chat-empty-state'
import MyChatComposer from './my-chat-composer'
import MyChatList from './my-chat-list'
import { generateStyles } from './styles'
import { useConversation } from './use-conversation'
import type { ChatMessage, MessageAction } from './types'

export interface ChatSuggestionInput {
  id: string
  label: string
}

export interface MyChatProps {
  adapter: ChatAdapter
  onAction: (action: MessageAction) => void
  renderCustomMessage?: RenderCustomMessage
  initialMessages?: ChatMessage[]
  emptyStateTitle: string
  emptyStateSubtitle?: string
  suggestions?: ChatSuggestionInput[]
}

function MyChat({
  adapter,
  onAction,
  renderCustomMessage,
  initialMessages,
  emptyStateTitle,
  emptyStateSubtitle,
  suggestions,
}: MyChatProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing, isMobileSize } = useTheme()
  const chat = useConversation({ adapter, initialMessages })
  const { send, sendImage } = chat
  const hasMessages = chat.messages.length > 0
  const [scrollToEndToken, setScrollToEndToken] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [composerHeight, setComposerHeight] = useState(0)
  const columnGutter = getChatColumnGutter(viewportWidth, isMobileSize, getSpacing('x6'))

  const handleRootLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width
    setViewportWidth((current) => (current === next ? current : next))
  }, [])

  const handleComposerLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height
    setComposerHeight((current) => (current === next ? current : next))
  }, [])

  const pinListToBottom = useCallback(() => {
    setScrollToEndToken((current) => current + 1)
  }, [])

  const handleSend = useCallback(
    (text: string) => {
      send(text)
      pinListToBottom()
    },
    [pinListToBottom, send],
  )

  const handleSendImage = useCallback(
    (imageUri: string) => {
      sendImage(imageUri)
      pinListToBottom()
    },
    [pinListToBottom, sendImage],
  )

  // List + composer share UI-thread translateY so open/close stay in sync.
  // Do not add post-open list inset/offset — that snaps after the keyboard animation.
  const { height } = useReanimatedKeyboardAnimation()
  const keyboardLiftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: isWeb ? 0 : height.value }],
  }))

  const resolvedSuggestions = useMemo<ChatSuggestion[]>(
    () =>
      (suggestions ?? []).map((suggestion) => ({
        id: suggestion.id,
        label: suggestion.label,
        onPress: () => send(suggestion.label),
      })),
    [suggestions, send],
  )

  return (
    <MyView style={styles.root} onLayout={handleRootLayout}>
      <MyView style={styles.column}>
        <Animated.View style={[styles.listWrapper, keyboardLiftStyle]}>
          <ConditionRenderer
            when={hasMessages}
            fallback={
              <MyChatEmptyState
                title={emptyStateTitle}
                subtitle={emptyStateSubtitle}
                suggestions={resolvedSuggestions}
                columnGutter={columnGutter}
                composerHeight={composerHeight}
              />
            }
          >
            <MyChatList
              messages={chat.messages}
              onSelectOption={chat.selectOption}
              onConfirm={chat.confirm}
              onSubmitForm={chat.submitForm}
              onRetry={chat.retry}
              onAction={onAction}
              renderCustomMessage={renderCustomMessage}
              scrollToEndToken={scrollToEndToken}
              columnGutter={columnGutter}
              composerHeight={composerHeight}
            />
          </ConditionRenderer>
        </Animated.View>

        <Animated.View
          style={[styles.composerFloatingWrapper, keyboardLiftStyle]}
          onLayout={handleComposerLayout}
        >
          <MyChatComposer
            onSend={handleSend}
            onSendImage={handleSendImage}
            disabled={chat.isSending}
          />
        </Animated.View>
      </MyView>
    </MyView>
  )
}

export default MyChat
