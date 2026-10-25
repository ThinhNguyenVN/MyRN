import type { CardLockState, ChatFormValues, ChatMessage, ChatMessageError } from './types'

export interface ConversationState {
  messages: ChatMessage[]
  isSending: boolean
  /** Failed assistant message turned into a typing row by `reset_for_retry`; the retried reply takes its slot. */
  retryPlaceholderId?: string
}

export const initialConversationState = (
  initialMessages: ChatMessage[] = [],
): ConversationState => ({
  messages: initialMessages,
  isSending: false,
})

export type ConversationAction =
  | { type: 'append_message'; message: ChatMessage }
  | { type: 'select_option'; messageId: string; optionId: string }
  | { type: 'confirm'; messageId: string; confirmed: boolean }
  | { type: 'select_media'; messageId: string; mediaIds: string[] }
  | { type: 'submit_form'; messageId: string; values: ChatFormValues }
  | { type: 'append_chunk'; messageId: string; delta: string }
  | { type: 'set_message'; message: ChatMessage }
  | { type: 'set_error'; messageId: string; error: ChatMessageError }
  /** `dropTyping`: no other turn is running, so also drop any empty `pending` assistant text (a typing row). */
  | { type: 'set_done'; messageId: string; dropTyping?: boolean }
  | { type: 'set_card_lock'; messageId: string; state: CardLockState }
  | { type: 'set_sending'; isSending: boolean }
  | { type: 'reset_for_retry'; messageId: string }
  /** The retried request ended without a message: remove its typing placeholder. */
  | { type: 'drop_retry_placeholder'; messageId: string }

function isTyping(message: ChatMessage): boolean {
  return (
    message.role === 'assistant' &&
    message.kind === 'text' &&
    message.status === 'pending' &&
    message.text === ''
  )
}

function mapMessage(
  messages: ChatMessage[],
  messageId: string,
  update: (message: ChatMessage) => ChatMessage,
): ChatMessage[] {
  return messages.map((message) => (message.id === messageId ? update(message) : message))
}

/** Adds a new message, in the retry placeholder's slot when there is one, so the list keeps its length. */
function addMessage(state: ConversationState, message: ChatMessage): ConversationState {
  const index = state.retryPlaceholderId
    ? state.messages.findIndex((item) => item.id === state.retryPlaceholderId)
    : -1
  if (index === -1) {
    return { ...state, messages: [...state.messages, message] }
  }
  const messages = [...state.messages]
  messages[index] = message
  return { ...state, messages, retryPlaceholderId: undefined }
}

export function conversationReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case 'append_message':
      return addMessage(state, action.message)

    case 'select_option':
      return {
        ...state,
        messages: mapMessage(state.messages, action.messageId, (message) =>
          message.kind === 'options' && message.selectedOptionId === undefined
            ? { ...message, selectedOptionId: action.optionId, status: 'complete' }
            : message,
        ),
      }

    case 'confirm':
      return {
        ...state,
        messages: mapMessage(state.messages, action.messageId, (message) =>
          message.kind === 'confirmation' && message.resolution === undefined
            ? {
                ...message,
                resolution: action.confirmed ? 'confirmed' : 'cancelled',
                status: 'complete',
              }
            : message,
        ),
      }

    case 'select_media':
      return {
        ...state,
        messages: mapMessage(state.messages, action.messageId, (message) =>
          message.kind === 'media_choice' && message.selectedMediaIds === undefined
            ? { ...message, selectedMediaIds: action.mediaIds, status: 'complete' }
            : message,
        ),
      }

    case 'submit_form':
      return {
        ...state,
        messages: mapMessage(state.messages, action.messageId, (message) =>
          message.kind === 'form' && message.submittedValues === undefined
            ? { ...message, submittedValues: action.values, status: 'complete' }
            : message,
        ),
      }

    case 'append_chunk':
      return {
        ...state,
        messages: mapMessage(state.messages, action.messageId, (message) =>
          message.kind === 'text'
            ? { ...message, text: message.text + action.delta, status: 'streaming' }
            : message,
        ),
      }

    case 'set_message': {
      const exists = state.messages.some((message) => message.id === action.message.id)
      if (!exists) {
        return addMessage(state, action.message)
      }
      return {
        ...state,
        messages: mapMessage(state.messages, action.message.id, () => action.message),
        retryPlaceholderId:
          state.retryPlaceholderId === action.message.id ? undefined : state.retryPlaceholderId,
      }
    }

    case 'set_error':
      return {
        ...state,
        messages: mapMessage(state.messages, action.messageId, (message) => ({
          ...message,
          status: 'error',
          error: action.error,
        })),
      }

    case 'set_done': {
      const messages = mapMessage(state.messages, action.messageId, (message) =>
        message.status === 'error' ? message : { ...message, status: 'complete' },
      )
      if (!action.dropTyping) {
        return { ...state, messages, isSending: false }
      }
      return {
        ...state,
        messages: messages.filter((message) => !isTyping(message)),
        isSending: false,
        retryPlaceholderId: undefined,
      }
    }

    case 'set_card_lock':
      return {
        ...state,
        messages: mapMessage(state.messages, action.messageId, (message) =>
          message.kind === 'options' ||
          message.kind === 'confirmation' ||
          message.kind === 'media_choice'
            ? { ...message, lockState: action.state }
            : message,
        ),
      }

    case 'set_sending':
      return { ...state, isSending: action.isSending }

    // The failed assistant message becomes a typing row in the same slot, so the list does not
    // shrink and jump; the retried request's first message replaces it.
    case 'reset_for_retry': {
      const failed = state.messages.find((message) => message.id === action.messageId)
      if (failed?.role !== 'assistant') {
        return state
      }
      const placeholder: ChatMessage = {
        id: failed.id,
        role: 'assistant',
        createdAt: failed.createdAt,
        status: 'pending',
        kind: 'text',
        text: '',
      }
      return {
        ...state,
        messages: mapMessage(state.messages, failed.id, () => placeholder),
        retryPlaceholderId: failed.id,
      }
    }

    case 'drop_retry_placeholder':
      if (state.retryPlaceholderId !== action.messageId) {
        return state
      }
      return {
        ...state,
        messages: state.messages.filter((message) => message.id !== action.messageId),
        retryPlaceholderId: undefined,
      }

    default:
      return state
  }
}
