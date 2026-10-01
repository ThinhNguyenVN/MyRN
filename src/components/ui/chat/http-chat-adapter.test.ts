import { consumeNdjsonBuffer, createHttpChatAdapter, parseNdjsonLine } from './http-chat-adapter'
import type { ChatStreamHandlers } from './chat-adapter'

jest.mock('@/constants/dimensions', () => ({
  ...jest.requireActual('@/constants/dimensions'),
  isWeb: true,
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
  })
})
