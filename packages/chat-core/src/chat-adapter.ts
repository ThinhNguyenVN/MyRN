import type { CardLockState, ChatMessage, ChatMessageError, ConversationEvent } from './types'

export interface ChatRequest {
  event: ConversationEvent
  history: ChatMessage[]
}

export interface ChatStreamHandlers {
  onMessageStart: (message: ChatMessage) => void
  onTextChunk: (messageId: string, delta: string) => void
  onMessage: (message: ChatMessage) => void
  onCardState: (messageId: string, state: CardLockState) => void
  onError: (messageId: string, error: ChatMessageError) => void
  onDone: (messageId: string) => void
}

export interface ChatAdapter {
  send: (request: ChatRequest, handlers: ChatStreamHandlers) => Promise<void>
  cancel?: (messageId: string) => void
  /** Xóa session server đang lưu cho app và user của adapter này (`DELETE /session`). */
  clearSession?: () => Promise<void>
  /** Xóa mọi session server của app và user này (`DELETE /sessions`). */
  clearAllSessions?: () => Promise<void>
}
