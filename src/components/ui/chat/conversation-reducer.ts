import type { ChatFormValues, ChatMessage, ChatMessageError } from './types'

export interface ConversationState {
  messages: ChatMessage[]
  isSending: boolean
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
  | { type: 'submit_form'; messageId: string; values: ChatFormValues }
  | { type: 'append_chunk'; messageId: string; delta: string }
  | { type: 'set_message'; message: ChatMessage }
  | { type: 'set_error'; messageId: string; error: ChatMessageError }
  | { type: 'set_done'; messageId: string }
  | { type: 'set_sending'; isSending: boolean }
  | { type: 'reset_for_retry'; messageId: string }

function mapMessage(
  messages: ChatMessage[],
  messageId: string,
  update: (message: ChatMessage) => ChatMessage,
): ChatMessage[] {
  return messages.map((message) => (message.id === messageId ? update(message) : message))
}

export function conversationReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case 'append_message':
      return { ...state, messages: [...state.messages, action.message] }

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
      return {
        ...state,
        messages: exists
          ? mapMessage(state.messages, action.message.id, () => action.message)
          : [...state.messages, action.message],
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

    case 'set_done':
      return {
        ...state,
        messages: mapMessage(state.messages, action.messageId, (message) =>
          message.status === 'error' ? message : { ...message, status: 'complete' },
        ),
        isSending: false,
      }

    case 'set_sending':
      return { ...state, isSending: action.isSending }

    case 'reset_for_retry':
      return {
        ...state,
        messages: mapMessage(state.messages, action.messageId, (message) =>
          message.kind === 'text'
            ? { ...message, text: '', status: 'pending', error: undefined }
            : { ...message, status: 'pending', error: undefined },
        ),
      }

    default:
      return state
  }
}
