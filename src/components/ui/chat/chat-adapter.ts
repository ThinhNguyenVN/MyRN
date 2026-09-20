import type { ReactElement } from 'react'

import type { ChatMessage, ChatMessageError, ConversationEvent, CustomMessage } from './types'

export interface ChatRequest {
  event: ConversationEvent
  history: ChatMessage[]
}

export interface ChatStreamHandlers {
  onMessageStart: (message: ChatMessage) => void
  onTextChunk: (messageId: string, delta: string) => void
  onMessage: (message: ChatMessage) => void
  onError: (messageId: string, error: ChatMessageError) => void
  onDone: (messageId: string) => void
}

export interface ChatAdapter {
  send: (request: ChatRequest, handlers: ChatStreamHandlers) => Promise<void>
  cancel?: (messageId: string) => void
}

/** Return `null` when the app doesn't recognize `message.customType` — MyChat falls back to `MyChatUnknownMessage`. */
export type RenderCustomMessage = (message: CustomMessage) => ReactElement | null
