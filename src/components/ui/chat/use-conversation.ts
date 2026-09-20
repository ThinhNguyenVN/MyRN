import { useCallback, useReducer, useRef } from 'react'

import type { ChatAdapter, ChatRequest, ChatStreamHandlers } from './chat-adapter'
import { conversationReducer, initialConversationState } from './conversation-reducer'
import { generateMessageId } from './generate-message-id'
import type { ChatFormValues, ChatMessage } from './types'

export interface UseConversationOptions {
  adapter: ChatAdapter
  initialMessages?: ChatMessage[]
}

export interface UseConversationResult {
  messages: ChatMessage[]
  isSending: boolean
  send: (text: string) => void
  sendImages: (imageUris: string[], caption?: string) => void
  selectOption: (messageId: string, optionId: string) => void
  confirm: (messageId: string, confirmed: boolean) => void
  submitForm: (messageId: string, values: ChatFormValues) => void
  retry: (messageId: string) => void
}

function userTextMessage(text: string): ChatMessage {
  return {
    id: generateMessageId('user'),
    role: 'user',
    createdAt: Date.now(),
    status: 'complete',
    kind: 'text',
    text,
  }
}

function userImageMessage(imageUris: string[], caption?: string): ChatMessage {
  return {
    id: generateMessageId('user'),
    role: 'user',
    createdAt: Date.now(),
    status: 'complete',
    kind: 'image',
    imageUris,
    caption,
  }
}

export function useConversation({
  adapter,
  initialMessages,
}: UseConversationOptions): UseConversationResult {
  const [state, dispatch] = useReducer(
    conversationReducer,
    initialConversationState(initialMessages),
  )
  const stateRef = useRef(state)
  stateRef.current = state
  const lastRequestRef = useRef<ChatRequest | null>(null)

  const runRequest = useCallback(
    (request: ChatRequest) => {
      lastRequestRef.current = request
      dispatch({ type: 'set_sending', isSending: true })

      let currentMessageId: string | null = null

      const handlers: ChatStreamHandlers = {
        onMessageStart: (message) => {
          currentMessageId = message.id
          dispatch({ type: 'append_message', message })
        },
        onTextChunk: (messageId, delta) => {
          dispatch({ type: 'append_chunk', messageId, delta })
        },
        onMessage: (message) => {
          currentMessageId = message.id
          dispatch({ type: 'set_message', message })
        },
        onError: (messageId, error) => {
          dispatch({ type: 'set_error', messageId, error })
        },
        onDone: (messageId) => {
          dispatch({ type: 'set_done', messageId })
        },
      }

      adapter.send(request, handlers).catch((caughtError: unknown) => {
        const messageId = currentMessageId
        if (messageId) {
          const message = caughtError instanceof Error ? caughtError.message : 'Unexpected error'
          dispatch({ type: 'set_error', messageId, error: { message } })
          dispatch({ type: 'set_done', messageId })
        } else {
          dispatch({ type: 'set_sending', isSending: false })
        }
      })
    },
    [adapter],
  )

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || stateRef.current.isSending) {
        return
      }
      const message = userTextMessage(trimmed)
      dispatch({ type: 'append_message', message })
      runRequest({
        event: { type: 'send_text', text: trimmed },
        history: [...stateRef.current.messages, message],
      })
    },
    [runRequest],
  )

  const sendImages = useCallback(
    (imageUris: string[], caption?: string) => {
      if (imageUris.length === 0 || stateRef.current.isSending) {
        return
      }
      const message = userImageMessage(imageUris, caption)
      dispatch({ type: 'append_message', message })
      runRequest({
        event: { type: 'send_images', imageUris, caption },
        history: [...stateRef.current.messages, message],
      })
    },
    [runRequest],
  )

  const selectOption = useCallback(
    (messageId: string, optionId: string) => {
      dispatch({ type: 'select_option', messageId, optionId })
      runRequest({
        event: { type: 'select_option', messageId, optionId },
        history: stateRef.current.messages,
      })
    },
    [runRequest],
  )

  const confirm = useCallback(
    (messageId: string, confirmed: boolean) => {
      dispatch({ type: 'confirm', messageId, confirmed })
      runRequest({
        event: { type: 'confirm', messageId, confirmed },
        history: stateRef.current.messages,
      })
    },
    [runRequest],
  )

  const submitForm = useCallback(
    (messageId: string, values: ChatFormValues) => {
      dispatch({ type: 'submit_form', messageId, values })
      runRequest({
        event: { type: 'submit_form', messageId, values },
        history: stateRef.current.messages,
      })
    },
    [runRequest],
  )

  const retry = useCallback(
    (messageId: string) => {
      dispatch({ type: 'reset_for_retry', messageId })
      if (lastRequestRef.current) {
        runRequest(lastRequestRef.current)
      }
    },
    [runRequest],
  )

  return {
    messages: state.messages,
    isSending: state.isSending,
    send,
    sendImages,
    selectOption,
    confirm,
    submitForm,
    retry,
  }
}
