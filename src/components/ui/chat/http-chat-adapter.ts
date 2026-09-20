import { isWeb } from '@/constants/dimensions'

import type { ChatAdapter, ChatRequest, ChatStreamHandlers } from './chat-adapter'
import { generateMessageId } from './generate-message-id'
import type { ChatMessage } from './types'

export interface HttpChatAdapterOptions {
  url: string
  headers?: Record<string, string>
}

type NdjsonEvent =
  | { type: 'chunk'; messageId: string; delta: string }
  | { type: 'message'; message: ChatMessage }
  | { type: 'error'; messageId: string; error: { message: string } }
  | { type: 'done'; messageId: string }

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
      handlers.onDone(event.messageId)
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
): string {
  const lines = buffer.split('\n')
  const remainder = lines.pop() ?? ''
  for (const line of lines) {
    const event = parseNdjsonLine(line)
    if (event) {
      dispatchNdjsonEvent(event, handlers, onMessageIdSeen)
    }
  }
  return remainder
}

function flushRemainder(
  remainder: string,
  handlers: ChatStreamHandlers,
  onMessageIdSeen: (messageId: string) => void,
): void {
  const event = parseNdjsonLine(remainder)
  if (event) {
    dispatchNdjsonEvent(event, handlers, onMessageIdSeen)
  }
}

async function sendWeb(
  url: string,
  requestInit: RequestInit,
  handlers: ChatStreamHandlers,
  onMessageIdSeen: (messageId: string) => void,
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
    buffer = consumeNdjsonBuffer(buffer, handlers, onMessageIdSeen)
  }

  flushRemainder(buffer, handlers, onMessageIdSeen)
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
      buffer = consumeNdjsonBuffer(buffer, handlers, onMessageIdSeen)
    }

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`HTTP ${xhr.status}`))
        return
      }
      flushRemainder(buffer, handlers, onMessageIdSeen)
      resolve()
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(requestInit.body as string)
  })
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

      const requestInit: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        body: JSON.stringify(request),
      }

      try {
        if (isWeb) {
          await sendWeb(options.url, requestInit, handlers, onMessageIdSeen)
        } else {
          await sendNative(options.url, requestInit, handlers, onMessageIdSeen)
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
      }
    },
  }
}
