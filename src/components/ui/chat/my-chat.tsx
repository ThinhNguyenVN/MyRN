import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'

import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { isAndroid, isWeb } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import type { ChatAdapter, RenderCustomMessage } from './chat-adapter'
import { COMPOSER_HEIGHT_COMMIT_THRESHOLD } from './constants'
import type { ChatSuggestion } from './my-chat-empty-state'
import MyChatEmptyState from './my-chat-empty-state'
import MyChatComposer from './my-chat-composer'
import MyChatList from './my-chat-list'
import { generateStyles, getChatColumnGutter } from './styles'
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
  /** Fires whenever `messages` changes (append, chunk, error, retry...). Lets a caller lift and
   *  persist the conversation (e.g. into app state) so it survives this component unmounting —
   *  `MyChat` itself keeps no state outside its own lifetime. */
  onMessagesChange?: (messages: ChatMessage[]) => void
  emptyStateTitle: string
  emptyStateSubtitle?: string
  suggestions?: ChatSuggestionInput[]
}

function MyChat({
  adapter,
  onAction,
  renderCustomMessage,
  initialMessages,
  onMessagesChange,
  emptyStateTitle,
  emptyStateSubtitle,
  suggestions,
}: MyChatProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing, isMobileSize } = useTheme()
  const chat = useConversation({ adapter, initialMessages })

  useEffect(() => {
    onMessagesChange?.(chat.messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when messages themselves change, not on every caller re-render that hands in a new onMessagesChange identity
  }, [chat.messages])
  const { send, sendImages } = chat
  const hasMessages = chat.messages.length > 0
  const [scrollToEndToken, setScrollToEndToken] = useState(0)
  const [columnWidth, setColumnWidth] = useState(0)
  const [composerHeight, setComposerHeight] = useState(0)
  const isComposerFocusedRef = useRef(false)
  const columnGutter = getChatColumnGutter(columnWidth, isMobileSize, getSpacing('x4'))

  const handleColumnLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width
    setColumnWidth((current) => (current === next ? current : next))
  }, [])

  const handleComposerLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.height)
    setComposerHeight((current) =>
      Math.abs(current - next) < COMPOSER_HEIGHT_COMMIT_THRESHOLD ? current : next,
    )
  }, [])

  const handleComposerFocusChange = useCallback((focused: boolean) => {
    isComposerFocusedRef.current = focused
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

  const handleSendImages = useCallback(
    (imageUris: string[], caption?: string) => {
      sendImages(imageUris, caption)
      pinListToBottom()
    },
    [pinListToBottom, sendImages],
  )

  // Composer lifts with the keyboard. The list must NOT translateY — that moves the
  // FlashList viewport off-screen so offset 0 cannot show the first messages.
  // Shrink the list on the UI thread instead (same `height` shared value, no post-open snap).
  const { height } = useReanimatedKeyboardAnimation()
  const listKeyboardStyle = useAnimatedStyle(() => {
    if (isWeb) {
      return { marginBottom: 0 }
    }
    // Android + FlashList: MyChatList reserves the keyboard space itself, committing the
    // layout once per transition and masking it with a transform, because animating this
    // wrapper's `marginBottom` per frame was the Android jank. The empty state has no
    // list of its own, so it still relies on this wrapper shrinking around it.
    if (isAndroid && hasMessages) {
      return { marginBottom: 0 }
    }
    return { marginBottom: -height.value }
  })
  const composerKeyboardStyle = useAnimatedStyle(() => ({
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
      <MyView style={styles.column} onLayout={handleColumnLayout}>
        <Animated.View style={[styles.listWrapper, listKeyboardStyle]}>
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
              isComposerFocusedRef={isComposerFocusedRef}
              keyboardHeight={height}
            />
          </ConditionRenderer>
        </Animated.View>

        <Animated.View
          style={[styles.composerFloatingWrapper, composerKeyboardStyle]}
          onLayout={handleComposerLayout}
        >
          <MyChatComposer
            onSend={handleSend}
            onSendImages={handleSendImages}
            disabled={chat.isSending}
            onFocusChange={handleComposerFocusChange}
          />
        </Animated.View>
      </MyView>
    </MyView>
  )
}

export default MyChat
