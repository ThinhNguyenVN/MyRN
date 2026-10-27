import type {
  CardLockState,
  ChatMediaFile,
  ChatMediaRef,
  ChatMediaSource,
  ChatMessage,
  ChatMessageError,
  ChatSessionStart,
  ConversationEvent,
} from './types'

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
  /** `X-Chat-Contract` this adapter declares; `useConversation` sends `send_media` from 3. */
  contractVersion?: number
  /** Uploads one file (`POST /media`) and returns its id; without it images go as `send_images`. */
  uploadMedia?: (file: ChatMediaFile) => Promise<ChatMediaRef>
  /** Where to load a media id that has no local URI; `null` when it cannot be loaded. */
  mediaSource?: (id: string) => Promise<ChatMediaSource | null>
  /**
   * Contract v4: the greeting and shortcuts for an empty chat (`session_start`). `null` when the
   * gateway has none (older contract, a failed request): the app shows its own empty state.
   */
  startSession?: () => Promise<ChatSessionStart | null>
  /** Xóa session server đang lưu cho app và user của adapter này (`DELETE /session`). */
  clearSession?: () => Promise<void>
  /** Xóa mọi session server của app và user này (`DELETE /sessions`). */
  clearAllSessions?: () => Promise<void>
}
