import React, { useCallback, useMemo, useState } from 'react'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'

import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { isWeb } from '@/constants/dimensions'
import { useThemedStyles } from '@/theme/theme-context'

import type { ChatAdapter, RenderCustomMessage } from './chat-adapter'
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
  const chat = useConversation({ adapter, initialMessages })
  const { send, sendImage } = chat
  const hasMessages = chat.messages.length > 0
  const [scrollToEndToken, setScrollToEndToken] = useState(0)

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

  // Keyboard approach (keep these together — they fight if mixed):
  // 1. List + composer share UI-thread translateY so open/close stay in sync (no sink-then-jump).
  // 2. After the keyboard is fully open, MyChatList adds top content inset = keyboard height
  //    and bumps scroll offset by the same amount so the first messages are reachable.
  // 3. That inset is removed at keyboard-close *start* (not after animation) so JS never lags.
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
    <MyView style={styles.root}>
      <Animated.View style={[styles.listWrapper, keyboardLiftStyle]}>
        <ConditionRenderer
          when={hasMessages}
          fallback={
            <MyChatEmptyState
              title={emptyStateTitle}
              subtitle={emptyStateSubtitle}
              suggestions={resolvedSuggestions}
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
          />
        </ConditionRenderer>
      </Animated.View>

      <Animated.View style={[styles.composerFloatingWrapper, keyboardLiftStyle]}>
        <MyChatComposer
          onSend={handleSend}
          onSendImage={handleSendImage}
          disabled={chat.isSending}
        />
      </Animated.View>
    </MyView>
  )
}

export default MyChat
