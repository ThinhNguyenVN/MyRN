export type ChatMessageRole = 'user' | 'assistant' | 'system'

export type ChatMessageStatus = 'pending' | 'streaming' | 'complete' | 'error'

export interface ChatMessageError {
  message: string
}

interface ChatMessageBase {
  id: string
  role: ChatMessageRole
  createdAt: number
  status: ChatMessageStatus
  error?: ChatMessageError
}

export interface TextMessage extends ChatMessageBase {
  kind: 'text'
  text: string
}

export interface ImageMessage extends ChatMessageBase {
  kind: 'image'
  imageUri: string
  caption?: string
}

export interface ChatOption {
  id: string
  label: string
}

export interface OptionsMessage extends ChatMessageBase {
  kind: 'options'
  prompt: string
  options: ChatOption[]
  allowCustomInput?: boolean
  selectedOptionId?: string
}

export interface ChatSummaryField {
  label: string
  value: string
}

export type ConfirmationResolution = 'confirmed' | 'cancelled'

export interface ConfirmationMessage extends ChatMessageBase {
  kind: 'confirmation'
  prompt: string
  summary?: ChatSummaryField[]
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  resolution?: ConfirmationResolution
}

export type ChatFormFieldType = 'text' | 'number' | 'select'

export interface ChatFormField {
  name: string
  label: string
  type: ChatFormFieldType
  options?: ChatOption[]
  required?: boolean
}

export type ChatFormValues = Record<string, string | number>

export interface FormMessage extends ChatMessageBase {
  kind: 'form'
  title?: string
  fields: ChatFormField[]
  submitLabel?: string
  submittedValues?: ChatFormValues
}

export type MessageAction =
  | { type: 'navigate'; label: string; href: string; icon?: string }
  | { type: 'external_link'; label: string; url: string; icon?: string }
  | { type: 'custom'; label: string; id: string; payload?: unknown; icon?: string }

export interface ResultMessage extends ChatMessageBase {
  kind: 'result'
  title: string
  summary?: ChatSummaryField[]
  actions?: MessageAction[]
}

export interface CustomMessage extends ChatMessageBase {
  kind: 'custom'
  customType: string
  payload: unknown
}

export type ChatMessage =
  | TextMessage
  | ImageMessage
  | OptionsMessage
  | ConfirmationMessage
  | FormMessage
  | ResultMessage
  | CustomMessage

export type ConversationEvent =
  | { type: 'send_text'; text: string }
  | { type: 'send_image'; imageUri: string; caption?: string }
  | { type: 'select_option'; messageId: string; optionId: string }
  | { type: 'confirm'; messageId: string; confirmed: boolean }
  | { type: 'submit_form'; messageId: string; values: ChatFormValues }
  | { type: 'retry'; messageId: string }
