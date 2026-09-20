import { consumeNdjsonBuffer, parseNdjsonLine } from './http-chat-adapter'
import type { ChatStreamHandlers } from './chat-adapter'

function collectHandlers() {
  const calls: string[] = []
  const handlers: ChatStreamHandlers = {
    onMessageStart: () => calls.push('start'),
    onTextChunk: (id, delta) => calls.push(`chunk:${id}:${delta}`),
    onMessage: (message) => calls.push(`message:${message.id}`),
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
