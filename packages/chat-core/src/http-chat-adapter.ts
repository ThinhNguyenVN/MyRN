import type { ChatAdapter, ChatRequest, ChatStreamHandlers } from './chat-adapter'
import { generateMessageId } from './generate-message-id'
import { isWeb } from './platform'
import {
  CARD_LOCK_STATES,
  type CardLockState,
  type ChatMediaFile,
  type ChatMediaKind,
  type ChatMediaRef,
  type ChatMessage,
  type ChatSessionStart,
} from './types'

/** Nơi app lưu id session (SecureStore, localStorage, AsyncStorage…); package không tự chọn. */
export interface ChatSessionStorage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

/** App và user để key id session. Không có thì adapter không gửi `X-Chat-Session`. */
export interface ChatSessionScope {
  appId: string
  userId: string
  storage: ChatSessionStorage
}

export interface HttpChatAdapterOptions {
  url: string
  headers?: Record<string, string>
  /** Gửi `X-Chat-Contract`; bỏ trống = contract v1. Từ 3 thì ảnh đi qua `POST /media` + `send_media`. */
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
/** The first contract with the empty-chat greeting (`session_start`, `quick_action`). */
const QUICK_ACTION_CONTRACT = 4

type NdjsonEvent =
  | { type: 'chunk'; messageId: string; delta: string }
  | { type: 'message'; message: ChatMessage }
  | { type: 'error'; messageId: string; error: { message: string } }
  | { type: 'done'; messageId: string; sessionId?: string }
  | { type: 'card_state'; messageId: string; state: string }
  | ({ type: 'session_start' } & ChatSessionStart)

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

/** The `session_start` line of a response body (contract v4); `null` when it has none or is not well formed. */
export function parseSessionStart(body: string): ChatSessionStart | null {
  for (const line of body.split('\n')) {
    const event = parseNdjsonLine(line)
    if (event?.type !== 'session_start') continue
    const { greeting, quickActions } = event
    if (
      typeof greeting?.title !== 'string' ||
      typeof greeting.subtitle !== 'string' ||
      !Array.isArray(quickActions)
    ) {
      return null
    }
    return {
      greeting: { title: greeting.title, subtitle: greeting.subtitle },
      quickActions: quickActions.filter(
        (action) =>
          typeof action?.id === 'string' &&
          typeof action.label === 'string' &&
          (action.kind === 'run' || action.kind === 'prompt'),
      ),
    }
  }
  return null
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
      const stored = (await scope.storage.getItem(key))?.trim()
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
  await scope.storage.removeItem(key)
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

/** Bỏ `Content-Type: application/json` để `FormData` tự đặt boundary multipart. */
function mediaHeaders(options: HttpChatAdapterOptions): Record<string, string> {
  const headers = buildHeaders(options)
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === 'content-type') delete headers[key]
  }
  return headers
}

async function appendFile(form: FormData, file: ChatMediaFile): Promise<void> {
  if (isWeb) {
    const blob = file.file ?? (await (await fetch(file.uri)).blob())
    form.append('file', blob, file.name)
    return
  }
  // RN FormData nhận `{ uri, name, type }` cho file trên máy; type DOM không mô tả được dạng này.
  form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob)
}

interface MediaUploadResponse {
  id: string
  kind: ChatMediaKind
  sessionId?: string
}

function createMediaTransport(
  options: HttpChatAdapterOptions,
  scope: ChatSessionScope,
): Pick<ChatAdapter, 'uploadMedia' | 'mediaSource'> {
  const key = sessionStorageKey(scope)
  const readSessionId = async () => (await scope.storage.getItem(key))?.trim() || undefined
  /**
   * Upload đầu tiên khi chưa có session gửi `new` và gateway tạo session. Các upload song song
   * khác phải chờ id đó, nếu không mỗi file sẽ nằm ở một session riêng và `send_media` báo
   * `media.not_found`.
   */
  let creatingSession: Promise<unknown> | null = null

  const upload = async (file: ChatMediaFile, sessionId: string): Promise<ChatMediaRef> => {
    const form = new FormData()
    await appendFile(form, file)
    const response = await fetch(`${gatewayRoot(options.url)}/media`, {
      method: 'POST',
      headers: { ...mediaHeaders(options), [SESSION_HEADER]: sessionId },
      body: form,
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const body = (await response.json()) as MediaUploadResponse
    const returned = body.sessionId?.trim() || response.headers.get(SESSION_HEADER)?.trim()
    if (returned) {
      await scope.storage.setItem(key, returned).catch(() => undefined)
    }
    return { id: body.id, kind: body.kind }
  }

  return {
    async uploadMedia(file) {
      let sessionId = await readSessionId()
      if (!sessionId && creatingSession) {
        await creatingSession.catch(() => undefined)
        sessionId = await readSessionId()
      }
      if (sessionId) {
        return upload(file, sessionId)
      }
      const pending = upload(file, 'new')
      creatingSession = pending
      try {
        return await pending
      } finally {
        if (creatingSession === pending) creatingSession = null
      }
    },
    async mediaSource(id) {
      const sessionId = await readSessionId()
      if (!sessionId) return null
      return {
        uri: `${gatewayRoot(options.url)}/media/${encodeURIComponent(id)}`,
        headers: { ...mediaHeaders(options), [SESSION_HEADER]: sessionId },
      }
    },
  }
}

/**
 * Generic HTTP streaming adapter — chưa có backend thật để trỏ vào (Phase 5).
 * Không biết Gemini/OpenAI/MCP; chỉ nói NDJSON-over-HTTP với `ChatRequest`/`ChatStreamHandlers`.
 * Gửi ảnh (`uploadMedia`) cần `session`, vì gateway tính ảnh theo session.
 */
export function createHttpChatAdapter(options: HttpChatAdapterOptions): ChatAdapter {
  const scope = options.session
  return {
    contractVersion: options.contractVersion,
    ...(scope ? createMediaTransport(options, scope) : {}),
    async send(request: ChatRequest, handlers: ChatStreamHandlers): Promise<void> {
      let lastKnownMessageId: string | null = null
      const onMessageIdSeen = (messageId: string) => {
        lastKnownMessageId = messageId
      }

      const headers = buildHeaders(options)
      let persist: Promise<void> = Promise.resolve()
      const onSessionId = scope
        ? (sessionId: string) => {
            persist = persist.then(() =>
              scope.storage.setItem(sessionStorageKey(scope), sessionId).then(
                () => undefined,
                () => undefined,
              ),
            )
          }
        : undefined
      try {
        if (scope) {
          const stored = (await scope.storage.getItem(sessionStorageKey(scope)))?.trim()
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
    ...((options.contractVersion ?? 1) >= QUICK_ACTION_CONTRACT
      ? {
          async startSession() {
            try {
              // One short line, no stream: it is read whole, and sent without a session header
              // so the gateway makes no session for an empty chat.
              const response = await fetch(options.url, {
                method: 'POST',
                headers: buildHeaders(options),
                body: JSON.stringify({ event: { type: 'session_start' }, history: [] }),
              })
              return response.ok ? parseSessionStart(await response.text()) : null
            } catch {
              return null
            }
          },
        }
      : {}),
    clearSession: () => forgetServerSession(options, 'session'),
    clearAllSessions: () => forgetServerSession(options, 'sessions'),
  }
}
