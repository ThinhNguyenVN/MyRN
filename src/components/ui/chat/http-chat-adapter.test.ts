import { storageGetItem, storageRemoveItem, storageSetItem } from '@/utils/storage'

import { consumeNdjsonBuffer, createHttpChatAdapter, parseNdjsonLine } from './http-chat-adapter'
import type { ChatStreamHandlers } from './chat-adapter'

jest.mock('@/constants/dimensions', () => ({
  ...jest.requireActual('@/constants/dimensions'),
  isWeb: true,
}))

jest.mock('@/utils/storage', () => ({
  storageGetItem: jest.fn(async () => null),
  storageSetItem: jest.fn(async () => undefined),
  storageRemoveItem: jest.fn(async () => undefined),
}))

function collectHandlers() {
  const calls: string[] = []
  const handlers: ChatStreamHandlers = {
    onMessageStart: () => calls.push('start'),
    onTextChunk: (id, delta) => calls.push(`chunk:${id}:${delta}`),
    onMessage: (message) => calls.push(`message:${message.id}`),
    onCardState: (id, state) => calls.push(`card:${id}:${state}`),
    onError: (id, error) => calls.push(`error:${id}:${error.message}`),
    onDone: (id) => calls.push(`done:${id}`),
  }
  return { calls, handlers }
}

describe('parseNdjsonLine', () => {
  it('parses a valid JSON line', () => {
    expect(parseNdjsonLine('{"type":"chunk","messageId":"m1","delta":"hi"}')).toEqual({
      type: 'chunk',
      messageId: 'm1',
      delta: 'hi',
    })
  })

  it('returns null for blank or malformed lines', () => {
    expect(parseNdjsonLine('')).toBeNull()
    expect(parseNdjsonLine('   ')).toBeNull()
    expect(parseNdjsonLine('not json')).toBeNull()
  })
})

describe('consumeNdjsonBuffer', () => {
  it('dispatches complete lines and holds back an incomplete trailing line', () => {
    const { calls, handlers } = collectHandlers()
    const seen: string[] = []

    const remainder = consumeNdjsonBuffer(
      '{"type":"chunk","messageId":"m1","delta":"a"}\n{"type":"chunk","messageId":"m1","delta":"b"}\n{"type":"don',
      handlers,
      (id) => seen.push(id),
    )

    expect(calls).toEqual(['chunk:m1:a', 'chunk:m1:b'])
    expect(remainder).toBe('{"type":"don')
    expect(seen).toEqual(['m1', 'm1'])
  })

  it('dispatches a done event and reports its message id', () => {
    const { calls, handlers } = collectHandlers()
    const seen: string[] = []

    consumeNdjsonBuffer('{"type":"done","messageId":"m1"}\n', handlers, (id) => seen.push(id))

    expect(calls).toEqual(['done:m1'])
    expect(seen).toEqual(['m1'])
  })

  it('still dispatches done when the line also carries sessionId', () => {
    const { calls, handlers } = collectHandlers()
    const sessions: string[] = []

    expect(() =>
      consumeNdjsonBuffer(
        '{"type":"done","messageId":"m1","sessionId":"11111111-1111-4111-8111-111111111111"}\n',
        handlers,
        () => {},
        (id) => sessions.push(id),
      ),
    ).not.toThrow()

    expect(calls).toEqual(['done:m1'])
    expect(sessions).toEqual(['11111111-1111-4111-8111-111111111111'])
  })
})

describe('card_state events', () => {
  it('calls onCardState for known states without marking the message as seen', () => {
    const { calls, handlers } = collectHandlers()
    const seen: string[] = []

    consumeNdjsonBuffer(
      '{"type":"card_state","messageId":"old","state":"expired"}\n',
      handlers,
      (id) => seen.push(id),
    )

    expect(calls).toEqual(['card:old:expired'])
    expect(seen).toEqual([])
  })

  it('ignores unknown states', () => {
    const { calls, handlers } = collectHandlers()

    consumeNdjsonBuffer(
      '{"type":"card_state","messageId":"old","state":"frozen"}\n',
      handlers,
      () => {},
    )

    expect(calls).toEqual([])
  })
})

describe('createHttpChatAdapter headers', () => {
  const originalFetch = global.fetch
  let sentHeaders: Record<string, string>[]

  beforeEach(() => {
    sentHeaders = []
    global.fetch = jest.fn(async (_url: unknown, init?: RequestInit) => {
      sentHeaders.push(init?.headers as Record<string, string>)
      return {
        ok: true,
        status: 200,
        body: { getReader: () => ({ read: async () => ({ done: true }) }) },
      }
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  const request = { event: { type: 'send_text' as const, text: 'hi' }, history: [] }

  it('sends X-Chat-Contract and X-Locale, reading the locale on every send', async () => {
    let locale = 'vi'
    const adapter = createHttpChatAdapter({
      url: 'http://x',
      contractVersion: 2,
      getLocale: () => locale,
    })
    const { handlers } = collectHandlers()

    await adapter.send(request, handlers)
    locale = 'en'
    await adapter.send(request, handlers)

    expect(sentHeaders[0]).toMatchObject({ 'X-Chat-Contract': '2', 'X-Locale': 'vi' })
    expect(sentHeaders[1]).toMatchObject({ 'X-Chat-Contract': '2', 'X-Locale': 'en' })
  })

  it('sends neither header when the options are not given', async () => {
    const adapter = createHttpChatAdapter({
      url: 'http://x',
      headers: { Authorization: 'Bearer t' },
    })

    await adapter.send(request, collectHandlers().handlers)

    expect(sentHeaders[0]).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer t',
    })
    expect(sentHeaders[0]).not.toHaveProperty('X-Chat-Session')
  })
})

describe('server session', () => {
  const request = { event: { type: 'send_text' as const, text: 'hi' }, history: [] }
  const sessionId = '11111111-1111-4111-8111-111111111111'
  const scope = { appId: 'my-store', userId: 'user-1' }
  let stored: Map<string, string>
  let sent: { url: string; method: string; headers: Record<string, string> }[]

  function ndjsonBody(text: string) {
    const encoded = new TextEncoder().encode(text.endsWith('\n') ? text : `${text}\n`)
    let sentOnce = false
    return {
      getReader: () => ({
        read: async () => {
          if (sentOnce) return { done: true, value: undefined }
          sentOnce = true
          return { done: false, value: encoded }
        },
      }),
    }
  }

  beforeEach(() => {
    stored = new Map()
    sent = []
    jest.mocked(storageGetItem).mockImplementation(async (key: string) => stored.get(key) ?? null)
    jest.mocked(storageSetItem).mockImplementation(async (key: string, value: string) => {
      stored.set(key, value)
    })
    jest.mocked(storageRemoveItem).mockImplementation(async (key: string) => {
      stored.delete(key)
    })
    global.fetch = jest.fn(async (url: unknown, init?: RequestInit) => {
      sent.push({
        url: String(url),
        method: init?.method ?? 'GET',
        headers: init?.headers as Record<string, string>,
      })
      return {
        ok: true,
        status: 200,
        body: ndjsonBody(`{"type":"done","messageId":"m1","sessionId":"${sessionId}"}`),
      }
    }) as unknown as typeof fetch
  })

  it('sends new, stores done.sessionId, then sends that id', async () => {
    const adapter = createHttpChatAdapter({
      url: 'http://x/chat',
      headers: { Authorization: 'Bearer t' },
      session: scope,
    })
    const { handlers } = collectHandlers()

    await adapter.send(request, handlers)
    await adapter.send(request, handlers)

    expect(sent[0]?.headers['X-Chat-Session']).toBe('new')
    expect(stored.get('chat.session.my-store.user-1')).toBe(sessionId)
    expect(sent[1]?.headers['X-Chat-Session']).toBe(sessionId)
  })

  it('keeps a separate id for another user', async () => {
    const first = createHttpChatAdapter({ url: 'http://x/chat', session: scope })
    await first.send(request, collectHandlers().handlers)

    const second = createHttpChatAdapter({
      url: 'http://x/chat',
      session: { appId: 'my-store', userId: 'user-2' },
    })
    await second.send(request, collectHandlers().handlers)

    expect(sent[1]?.headers['X-Chat-Session']).toBe('new')
    expect(stored.get('chat.session.my-store.user-2')).toBe(sessionId)
  })

  it('clearSession deletes that session and drops the stored id', async () => {
    stored.set('chat.session.my-store.user-1', sessionId)
    const adapter = createHttpChatAdapter({
      url: 'http://x/chat',
      headers: { Authorization: 'Bearer t' },
      session: scope,
    })

    await adapter.clearSession?.()

    expect(sent[0]).toMatchObject({
      url: 'http://x/session',
      method: 'DELETE',
    })
    expect(sent[0]?.headers['X-Chat-Session']).toBe(sessionId)
    expect(sent[0]?.headers.Authorization).toBe('Bearer t')
    expect(stored.has('chat.session.my-store.user-1')).toBe(false)
  })

  it('clearAllSessions deletes every session even when the request fails', async () => {
    stored.set('chat.session.my-store.user-1', sessionId)
    const calls: string[] = []
    global.fetch = jest.fn(async (url: unknown, init?: RequestInit) => {
      calls.push(`${init?.method} ${String(url)}`)
      throw new Error('offline')
    }) as unknown as typeof fetch
    const adapter = createHttpChatAdapter({ url: 'http://localhost:3300/chat', session: scope })

    await expect(adapter.clearAllSessions?.()).rejects.toThrow('offline')
    expect(calls).toEqual(['DELETE http://localhost:3300/sessions'])
    expect(stored.has('chat.session.my-store.user-1')).toBe(false)
  })

  it('does not call the gateway when session is off', async () => {
    const adapter = createHttpChatAdapter({ url: 'http://x/chat' })

    await adapter.clearAllSessions?.()

    expect(sent).toEqual([])
  })
})
