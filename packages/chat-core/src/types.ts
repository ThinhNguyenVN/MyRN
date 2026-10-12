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
  /** 1-5 images sent together in this one message. */
  imageUris: string[]
  /** Gateway media ids (contract v3), same order as `imageUris`; set once every upload succeeds. */
  mediaIds?: string[]
  caption?: string
}

export type ChatMediaKind = 'image' | 'video'

/** A local file to upload before `send_media` (picker / camera result). */
export interface ChatMediaFile {
  uri: string
  name: string
  mimeType: string
  /** Web: the picked `File`, appended to the multipart body as is. */
  file?: File
}

export interface ChatMediaRef {
  id: string
  kind: ChatMediaKind
}

/** Where to load a gateway media id from (`GET /media/:id` with the chat headers). */
export interface ChatMediaSource {
  uri: string
  headers?: Record<string, string>
}

export interface ChatOption {
  id: string
  label: string
}

/** Khóa do server báo qua `card_state`; độc lập với `resolution`/`selectedOptionId` do user bấm. */
export type CardLockState = 'expired' | 'cancelled' | 'superseded'

export const CARD_LOCK_STATES: readonly CardLockState[] = ['expired', 'cancelled', 'superseded']

export interface OptionsMessage extends ChatMessageBase {
  kind: 'options'
  prompt: string
  options: ChatOption[]
  allowCustomInput?: boolean
  selectedOptionId?: string
  lockState?: CardLockState
  changedFields?: string[]
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
  lockState?: CardLockState
  /** `'media'` means the thumbnails changed. */
  changedFields?: string[]
  /** Gateway media ids shown as a thumbnail row (contract v3). */
  media?: string[]
}

/** Multi-select photo card (contract v3): pick `min`..`max` of `media`, then `select_media`. */
export interface MediaChoiceMessage extends ChatMessageBase {
  kind: 'media_choice'
  prompt: string
  media: string[]
  min: number
  max: number
  selectedMediaIds?: string[]
  lockState?: CardLockState
  changedFields?: string[]
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
  | MediaChoiceMessage
  | FormMessage
  | ResultMessage
  | CustomMessage

export type ConversationEvent =
  | { type: 'send_text'; text: string }
  | { type: 'send_images'; imageUris: string[]; caption?: string }
  | { type: 'send_media'; media: ChatMediaRef[]; caption?: string }
  | { type: 'select_media'; messageId: string; mediaIds: string[] }
  | { type: 'select_option'; messageId: string; optionId: string }
  | { type: 'confirm'; messageId: string; confirmed: boolean }
  | { type: 'submit_form'; messageId: string; values: ChatFormValues }
  | { type: 'retry'; messageId: string }
