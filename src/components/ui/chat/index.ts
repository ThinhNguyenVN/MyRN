export { default as MyChat } from './my-chat'
export type { MyChatProps, ChatSuggestionInput } from './my-chat'

export { default as MyChatList } from './my-chat-list'
export type { MyChatListProps } from './my-chat-list'

export { default as MyChatComposer } from './my-chat-composer'
export type { MyChatComposerProps } from './my-chat-composer'

export { default as MyChatEmptyState } from './my-chat-empty-state'
export type { MyChatEmptyStateProps, ChatSuggestion } from './my-chat-empty-state'

export { default as MyChatTyping } from './my-chat-typing'
export { default as MyChatActionRow } from './my-chat-action-row'
export type { MyChatActionRowProps } from './my-chat-action-row'
export { default as MyChatUnknownMessage } from './my-chat-unknown-message'

export type { RenderCustomMessage } from './types'

export {
  MockChatAdapter,
  createHttpChatAdapter,
  useConversation,
  generateMessageId,
} from '@thinhnguyenvn/chat-core'
export type {
  ChatAdapter,
  ChatRequest,
  ChatStreamHandlers,
  HttpChatAdapterOptions,
  ChatSessionStorage,
  UseConversationOptions,
  UseConversationResult,
  ChatMessage,
  ChatMessageRole,
  ChatMessageStatus,
  ChatMessageError,
  TextMessage,
  ImageMessage,
  ChatOption,
  OptionsMessage,
  ChatSummaryField,
  ConfirmationMessage,
  ConfirmationResolution,
  ChatFormField,
  ChatFormFieldType,
  ChatFormValues,
  FormMessage,
  MessageAction,
  ResultMessage,
  CustomMessage,
  ConversationEvent,
} from '@thinhnguyenvn/chat-core'
