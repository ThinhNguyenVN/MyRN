import { useCallback, useReducer, useRef } from 'react'

import type { ChatAdapter, ChatRequest, ChatStreamHandlers } from './chat-adapter'
import { conversationReducer, initialConversationState } from './conversation-reducer'
import { generateMessageId } from './generate-message-id'
import type {
  ChatFormValues,
  ChatMediaFile,
  ChatMediaRef,
  ChatMessage,
  ChatQuickAction,
  ImageMessage,
} from './types'

export interface UseConversationOptions {
  adapter: ChatAdapter
  initialMessages?: ChatMessage[]
}

export interface UseConversationResult {
  messages: ChatMessage[]
  isSending: boolean
  send: (text: string) => void
  sendImages: (imageUris: string[], caption?: string) => void
  /**
   * Gửi ảnh: adapter có `uploadMedia` và `contractVersion >= 3` thì upload rồi phát `send_media`,
   * nếu không thì như `sendImages`.
   */
  sendMedia: (files: ChatMediaFile[], caption?: string) => void
  /**
   * A shortcut of the empty chat (contract v4). `run` ones show their label as the user's message
   * and send `quick_action`; `prompt` ones are sent as the text of the label.
   */
  sendQuickAction: (action: ChatQuickAction) => void
  selectOption: (messageId: string, optionId: string) => void
  confirm: (messageId: string, confirmed: boolean) => void
  selectMedia: (messageId: string, mediaIds: string[]) => void
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

function userImageMessage(
  imageUris: string[],
  caption?: string,
  status: ImageMessage['status'] = 'complete',
): ImageMessage {
  return {
    id: generateMessageId('user'),
    role: 'user',
    createdAt: Date.now(),
    status,
    kind: 'image',
    imageUris,
    caption,
  }
}

const MEDIA_CONTRACT_VERSION = 3

/** Ảnh của một tin đang chờ upload; `refs[i]` có khi file `i` đã lên, để gửi lại chỉ upload phần lỗi. */
interface PendingUpload {
  files: ChatMediaFile[]
  refs: (ChatMediaRef | undefined)[]
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
  const pendingUploadsRef = useRef(new Map<string, PendingUpload>())
  /** Requests still running; only the last one to finish may drop leftover typing rows. */
  const inFlightRef = useRef(0)

  const runRequest = useCallback(
    (request: ChatRequest, retryPlaceholderId?: string) => {
      lastRequestRef.current = request
      dispatch({ type: 'set_sending', isSending: true })
      inFlightRef.current += 1

      let currentMessageId: string | null = null
      let finished = false
      const finish = (messageId: string | null) => {
        if (finished) return
        finished = true
        inFlightRef.current -= 1
        if (messageId) {
          dispatch({ type: 'set_done', messageId, dropTyping: inFlightRef.current === 0 })
        } else {
          if (retryPlaceholderId) {
            dispatch({ type: 'drop_retry_placeholder', messageId: retryPlaceholderId })
          }
          dispatch({ type: 'set_sending', isSending: false })
        }
      }

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
        onCardState: (messageId, state) => {
          dispatch({ type: 'set_card_lock', messageId, state })
        },
        onError: (messageId, error) => {
          dispatch({ type: 'set_error', messageId, error })
        },
        onDone: (messageId) => {
          finish(messageId)
        },
      }

      adapter
        .send(request, handlers)
        // An adapter that resolves without `onDone` still ends the turn.
        .then(() => finish(currentMessageId))
        .catch((caughtError: unknown) => {
          const messageId = currentMessageId
          if (messageId) {
            const message = caughtError instanceof Error ? caughtError.message : 'Unexpected error'
            dispatch({ type: 'set_error', messageId, error: { message } })
          }
          finish(messageId)
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

  const sendQuickAction = useCallback(
    (action: ChatQuickAction) => {
      if (action.kind === 'prompt') {
        send(action.label)
        return
      }
      if (stateRef.current.isSending) {
        return
      }
      const message = userTextMessage(action.label)
      dispatch({ type: 'append_message', message })
      runRequest({
        event: { type: 'quick_action', id: action.id },
        history: [...stateRef.current.messages, message],
      })
    },
    [runRequest, send],
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

  const uploadAndSend = useCallback(
    async (message: ImageMessage) => {
      const pending = pendingUploadsRef.current.get(message.id)
      const upload = adapter.uploadMedia
      if (!pending || !upload) {
        return
      }
      dispatch({ type: 'set_sending', isSending: true })
      try {
        await Promise.all(
          pending.files.map(async (file, index) => {
            pending.refs[index] ??= await upload(file)
          }),
        )
      } catch (caughtError: unknown) {
        const errorMessage = caughtError instanceof Error ? caughtError.message : 'Upload failed'
        dispatch({ type: 'set_error', messageId: message.id, error: { message: errorMessage } })
        dispatch({ type: 'set_sending', isSending: false })
        return
      }

      pendingUploadsRef.current.delete(message.id)
      const media = pending.refs as ChatMediaRef[]
      const sent: ImageMessage = {
        ...message,
        mediaIds: media.map((ref) => ref.id),
        status: 'complete',
        error: undefined,
      }
      dispatch({ type: 'set_message', message: sent })
      runRequest({
        event: { type: 'send_media', media, caption: message.caption },
        history: stateRef.current.messages.map((item) => (item.id === sent.id ? sent : item)),
      })
    },
    [adapter, runRequest],
  )

  const sendMedia = useCallback(
    (files: ChatMediaFile[], caption?: string) => {
      const canUpload =
        adapter.uploadMedia !== undefined &&
        (adapter.contractVersion ?? 1) >= MEDIA_CONTRACT_VERSION
      if (!canUpload) {
        sendImages(
          files.map((file) => file.uri),
          caption,
        )
        return
      }
      if (files.length === 0 || stateRef.current.isSending) {
        return
      }
      const message = userImageMessage(
        files.map((file) => file.uri),
        caption,
        'pending',
      )
      pendingUploadsRef.current.set(message.id, { files, refs: files.map(() => undefined) })
      dispatch({ type: 'append_message', message })
      void uploadAndSend(message)
    },
    [adapter, sendImages, uploadAndSend],
  )

  const selectMedia = useCallback(
    (messageId: string, mediaIds: string[]) => {
      dispatch({ type: 'select_media', messageId, mediaIds })
      runRequest({
        event: { type: 'select_media', messageId, mediaIds },
        history: stateRef.current.messages,
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
      // Upload lỗi: tin chưa tới gateway, nên chỉ upload lại rồi gửi, không chạy lại request cũ.
      const failedUpload = stateRef.current.messages.find(
        (message): message is ImageMessage => message.id === messageId && message.kind === 'image',
      )
      if (failedUpload && pendingUploadsRef.current.has(messageId)) {
        if (stateRef.current.isSending) return
        const retried: ImageMessage = { ...failedUpload, status: 'pending', error: undefined }
        dispatch({ type: 'set_message', message: retried })
        void uploadAndSend(retried)
        return
      }
      const lastRequest = lastRequestRef.current
      if (stateRef.current.isSending || !lastRequest) return
      const failedAssistant = stateRef.current.messages.some(
        (message) => message.id === messageId && message.role === 'assistant',
      )
      dispatch({ type: 'reset_for_retry', messageId })
      runRequest(lastRequest, failedAssistant ? messageId : undefined)
    },
    [runRequest, uploadAndSend],
  )

  return {
    messages: state.messages,
    isSending: state.isSending,
    send,
    sendImages,
    sendMedia,
    sendQuickAction,
    selectOption,
    confirm,
    selectMedia,
    submitForm,
    retry,
  }
}
