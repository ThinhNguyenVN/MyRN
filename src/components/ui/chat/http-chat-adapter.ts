import { isWeb } from '@/constants/dimensions'
import { storageGetItem, storageRemoveItem, storageSetItem } from '@/utils/storage'

import type { ChatAdapter, ChatRequest, ChatStreamHandlers } from './chat-adapter'
import { generateMessageId } from './generate-message-id'
import { CARD_LOCK_STATES, type CardLockState, type ChatMessage } from './types'

/** App và user để key id session. Không có thì adapter không gửi `X-Chat-Session`. */
export interface ChatSessionScope {
  appId: string
  userId: string
}

export interface HttpChatAdapterOptions {
  url: string
  headers?: Record<string, string>
  /** Gửi `X-Chat-Contract`; bỏ trống = contract v1. */
  contractVersion?: number
  /** Gọi mỗi lần `send()`; trả chuỗi không rỗng thì gửi `X-Locale`. */
  getLocale?: () => string | undefined
  /**
   * Giữ session ở gateway cho đúng app và user. Lượt đầu gửi `X-Chat-Session: new`,
   * các lượt sau gửi id đọc từ `done.sessionId`.
   */
  session?: ChatSessionScope
}

const SESSION_HEADER = 'X-Chat-Session'

type NdjsonEvent =
  | { type: 'chunk'; messageId: string; delta: string }
  | { type: 'message'; message: ChatMessage }
  | { type: 'error'; messageId: string; error: { message: string } }
  | { type: 'done'; messageId: string; sessionId?: string }
  | { type: 'card_state'; messageId: string; state: string }

/** Wire format: 1 dòng NDJSON = 1 event. Không phải chuẩn SSE — xem design.md Decision 4. */
export function parseNdjsonLine(line: string): NdjsonEvent | null {
  const trimmed = line.trim()
  if (!trimmed) {
    return null
  }
  try {
    return JSON.parse(trimmed) as NdjsonEvent
  } catch {
    return null
  }
}

function dispatchNdjsonEvent(
  event: NdjsonEvent,
  handlers: ChatStreamHandlers,
  onMessageIdSeen: (messageId: string) => void,
  onSessionId?: (sessionId: string) => void,
): void {
  switch (event.type) {
    case 'chunk':
      onMessageIdSeen(event.messageId)
      handlers.onTextChunk(event.messageId, event.delta)
      return
    case 'message':
      onMessageIdSeen(event.message.id)
      handlers.onMessage(event.message)
      return
    case 'error':
      onMessageIdSeen(event.messageId)
      handlers.onError(event.messageId, event.error)
      return
    case 'done':
      onMessageIdSeen(event.messageId)
      if (typeof event.sessionId === 'string' && event.sessionId.trim()) {
        onSessionId?.(event.sessionId.trim())
      }
      handlers.onDone(event.messageId)
      return
    case 'card_state':
      if (CARD_LOCK_STATES.includes(event.state as CardLockState)) {
        handlers.onCardState(event.messageId, event.state as CardLockState)
      }
      return
    default:
      return
  }
}

/** Cắt buffer theo dòng hoàn chỉnh, trả lại phần dư (dòng chưa đủ) để nối tiếp lần đọc sau. */
export function consumeNdjsonBuffer(
  buffer: string,
  handlers: ChatStreamHandlers,
  onMessageIdSeen: (messageId: string) => void,
  onSessionId?: (sessionId: string) => void,
): string {
  const lines = buffer.split('\n')
  const remainder = lines.pop() ?? ''
  for (const line of lines) {
    const event = parseNdjsonLine(line)
    if (event) {
      dispatchNdjsonEvent(event, handlers, onMessageIdSeen, onSessionId)
    }
  }
  return remainder
}

function flushRemainder(
  remainder: string,
  handlers: ChatStreamHandlers,
  onMessageIdSeen: (messageId: string) => void,
  onSessionId?: (sessionId: string) => void,
): void {
  const event = parseNdjsonLine(remainder)
  if (event) {
    dispatchNdjsonEvent(event, handlers, onMessageIdSeen, onSessionId)
  }
}

async function sendWeb(
  url: string,
  requestInit: RequestInit,
  handlers: ChatStreamHandlers,
  onMessageIdSeen: (messageId: string) => void,
  onSessionId?: (sessionId: string) => void,
): Promise<void> {
  const response = await fetch(url, requestInit)
  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    buffer = consumeNdjsonBuffer(buffer, handlers, onMessageIdSeen, onSessionId)
  }

  flushRemainder(buffer, handlers, onMessageIdSeen, onSessionId)
}

/**
 * Native: RN's `fetch` không đọc `ReadableStream` response body đáng tin cậy —
 * dùng `XMLHttpRequest` progressive-read (diff độ dài `responseText` trong `onprogress`).
 */
function sendNative(
  url: string,
  requestInit: RequestInit,
  handlers: ChatStreamHandlers,
  onMessageIdSeen: (messageId: string) => void,
  onSessionId?: (sessionId: string) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open((requestInit.method as string) ?? 'POST', url)
    const headers = (requestInit.headers as Record<string, string>) ?? {}
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value)
    }
    xhr.responseType = 'text'

    let processedLength = 0
    let buffer = ''

    xhr.onprogress = () => {
      const nextChunk = xhr.responseText.slice(processedLength)
      processedLength = xhr.responseText.length
      buffer += nextChunk
      buffer = consumeNdjsonBuffer(buffer, handlers, onMessageIdSeen, onSessionId)
    }

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`HTTP ${xhr.status}`))
        return
      }
      flushRemainder(buffer, handlers, onMessageIdSeen, onSessionId)
      resolve()
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(requestInit.body as string)
  })
}

/** SecureStore chỉ nhận `[A-Za-z0-9._-]`; localStorage không kén nhưng dùng cùng một key. */
function sessionStorageKey(scope: ChatSessionScope): string {
  const safe = (value: string) => value.replace(/[^A-Za-z0-9._-]/g, '_')
  return `chat.session.${safe(scope.appId)}.${safe(scope.userId)}`
}

/** `POST /chat` nằm ở gốc gateway; `DELETE /session` cùng gốc, không nằm dưới `/chat`. */
function gatewayRoot(chatUrl: string): string {
  return chatUrl.replace(/\/chat\/?$/, '')
}

async function forgetServerSession(
  options: HttpChatAdapterOptions,
  path: 'session' | 'sessions',
): Promise<void> {
  const scope = options.session
  if (!scope) return

  const key = sessionStorageKey(scope)
  let deleteError: unknown
  try {
    const headers = buildHeaders(options)
    if (path === 'session') {
      const stored = (await storageGetItem(key))?.trim()
      if (stored) headers[SESSION_HEADER] = stored
    }
    const response = await fetch(`${gatewayRoot(options.url)}/${path}`, {
      method: 'DELETE',
      headers,
    })
    if (!response.ok) {
      deleteError = new Error(`HTTP ${response.status}`)
    }
  } catch (caughtError) {
    deleteError = caughtError
  }
  await storageRemoveItem(key)
  if (deleteError) throw deleteError
}

function buildHeaders(options: HttpChatAdapterOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (options.contractVersion !== undefined) {
    headers['X-Chat-Contract'] = String(options.contractVersion)
  }
  const locale = options.getLocale?.()
  if (locale) {
    headers['X-Locale'] = locale
  }
  return headers
}

/**
 * Generic HTTP streaming adapter — chưa có backend thật để trỏ vào (Phase 5).
 * Không biết Gemini/OpenAI/MCP; chỉ nói NDJSON-over-HTTP với `ChatRequest`/`ChatStreamHandlers`.
 */
export function createHttpChatAdapter(options: HttpChatAdapterOptions): ChatAdapter {
  return {
    async send(request: ChatRequest, handlers: ChatStreamHandlers): Promise<void> {
      let lastKnownMessageId: string | null = null
      const onMessageIdSeen = (messageId: string) => {
        lastKnownMessageId = messageId
      }

      const headers = buildHeaders(options)
      const scope = options.session
      let persist: Promise<void> = Promise.resolve()
      const onSessionId = scope
        ? (sessionId: string) => {
            persist = persist.then(() =>
              storageSetItem(sessionStorageKey(scope), sessionId).then(
                () => undefined,
                () => undefined,
              ),
            )
          }
        : undefined
      try {
        if (scope) {
          const stored = (await storageGetItem(sessionStorageKey(scope)))?.trim()
          headers[SESSION_HEADER] = stored || 'new'
        }
        const requestInit: RequestInit = {
          method: 'POST',
          headers,
          body: JSON.stringify(request),
        }
        if (isWeb) {
          await sendWeb(options.url, requestInit, handlers, onMessageIdSeen, onSessionId)
        } else {
          await sendNative(options.url, requestInit, handlers, onMessageIdSeen, onSessionId)
        }
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : 'Network error'
        const messageId = lastKnownMessageId ?? generateMessageId('assistant')
        if (!lastKnownMessageId) {
          handlers.onMessageStart({
            id: messageId,
            role: 'assistant',
            createdAt: Date.now(),
            status: 'pending',
            kind: 'text',
            text: '',
          })
        }
        handlers.onError(messageId, { message })
        handlers.onDone(messageId)
      } finally {
        await persist
      }
    },
    clearSession: () => forgetServerSession(options, 'session'),
    clearAllSessions: () => forgetServerSession(options, 'sessions'),
  }
}
