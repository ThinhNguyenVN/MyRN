import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

import type { ChatStreamHandlers } from './chat-adapter'
import type { ChatMessage, ConfirmationMessage, ConversationEvent, ResultMessage } from './types'
import { consumeNdjsonBuffer, parseSessionStart } from './http-chat-adapter'

const CONTRACT_DIR = join(__dirname, '../contract')

interface Recorded {
  calls: string[]
  cardStates: { messageId: string; state: string }[]
  messages: ChatMessage[]
}

function replay(file: string): Recorded {
  const recorded: Recorded = { calls: [], cardStates: [], messages: [] }
  const handlers: ChatStreamHandlers = {
    onMessageStart: (message) => recorded.calls.push(`start:${message.id}`),
    onTextChunk: (id) => recorded.calls.push(`chunk:${id}`),
    onMessage: (message) => {
      recorded.calls.push(`message:${message.id}`)
      recorded.messages.push(message)
    },
    onCardState: (messageId, state) => {
      recorded.calls.push('card_state')
      recorded.cardStates.push({ messageId, state })
    },
    onError: (id) => recorded.calls.push(`error:${id}`),
    onDone: (id) => recorded.calls.push(`done:${id}`),
  }
  const text = readFileSync(file, 'utf8')
  const remainder = consumeNdjsonBuffer(
    text.endsWith('\n') ? text : `${text}\n`,
    handlers,
    () => {},
  )
  expect(remainder).toBe('')
  return recorded
}

function streamFiles(version: 'v1' | 'v2' | 'v3' | 'v4'): string[] {
  const dir = join(CONTRACT_DIR, version, 'streams')
  return (
    readdirSync(dir)
      // The empty chat's answer is one line and ends no turn (read by `parseSessionStart`).
      .filter((name) => name.endsWith('.ndjson') && name !== 'session-start.ndjson')
      .map((name) => join(dir, name))
  )
}

describe.each(['v1', 'v2', 'v3', 'v4'] as const)('contract %s streams', (version) => {
  it.each(streamFiles(version))(
    '%s ends with exactly one done and opens a message before chunks',
    (file) => {
      const { calls } = replay(file)

      expect(calls.filter((call) => call.startsWith('done:'))).toHaveLength(1)
      expect(calls[calls.length - 1]).toMatch(/^done:/)

      const firstChunk = calls.findIndex((call) => call.startsWith('chunk:'))
      if (firstChunk !== -1) {
        expect(calls.slice(0, firstChunk).some((call) => call.startsWith('message:'))).toBe(true)
      }
    },
  )
})

describe('contract v1 streams', () => {
  it.each(streamFiles('v1'))('%s never calls onCardState', (file) => {
    expect(replay(file).cardStates).toEqual([])
  })
})

describe('contract v2 streams', () => {
  it('expired-card locks the stale card before done', () => {
    const { calls, cardStates } = replay(join(CONTRACT_DIR, 'v2/streams/expired-card.ndjson'))

    expect(cardStates).toEqual([{ messageId: 'gone-card', state: 'expired' }])
    expect(calls.indexOf('card_state')).toBeLessThan(calls.findIndex((c) => c.startsWith('done:')))
  })

  it('cancelled-card locks the card as cancelled before done', () => {
    const { calls, cardStates } = replay(join(CONTRACT_DIR, 'v2/streams/cancelled-card.ndjson'))

    expect(cardStates).toEqual([{ messageId: 'cancelled-card', state: 'cancelled' }])
    expect(calls.indexOf('card_state')).toBeLessThan(calls.findIndex((c) => c.startsWith('done:')))
  })
})

describe('contract v3 streams', () => {
  it('media-choice carries the picked-from ids and the min..max range', () => {
    const { messages } = replay(join(CONTRACT_DIR, 'v3/streams/media-choice.ndjson'))
    const card = messages.find((message) => message.kind === 'media_choice')

    expect(card).toMatchObject({ kind: 'media_choice', min: 0, max: 1 })
    expect(card?.kind === 'media_choice' && card.media).toHaveLength(3)
  })

  it.each(['photo-confirmation.ndjson', 'media-picked.ndjson'])(
    '%s puts media ids on the confirmation card',
    (name) => {
      const { messages } = replay(join(CONTRACT_DIR, 'v3/streams', name))
      const card = messages.find((message) => message.kind === 'confirmation')

      expect(card?.kind === 'confirmation' && card.media).toEqual(['<id>'])
    },
  )
})

describe('contract v3 requests', () => {
  const read = (name: string) =>
    JSON.parse(readFileSync(join(CONTRACT_DIR, 'v3/requests', name), 'utf8')) as {
      event: ConversationEvent
    }

  it('send_media and select_media match ConversationEvent', () => {
    const sendMedia: ConversationEvent = read('send_media.json').event
    const selectMedia: ConversationEvent = read('select_media.json').event

    expect(sendMedia).toMatchObject({ type: 'send_media', media: [{ kind: 'image' }] })
    expect(selectMedia).toMatchObject({ type: 'select_media', messageId: 'media-card-1' })
  })
})

describe('contract v4', () => {
  const read = (...parts: string[]) => readFileSync(join(CONTRACT_DIR, 'v4', ...parts), 'utf8')

  it('session-start is read whole into a greeting and shortcuts', () => {
    const start = parseSessionStart(read('streams', 'session-start.ndjson'))

    expect(start?.greeting.title).toBe('Chào buổi sáng, Thịnh')
    expect(start?.quickActions.map((action) => action.kind)).toEqual(['run', 'prompt'])
  })

  it.each(['', 'not json', '{"type":"done","messageId":"x"}', '{"type":"session_start"}'])(
    'gives null for a body without a well formed session_start: %j',
    (body) => {
      expect(parseSessionStart(body)).toBeNull()
    },
  )

  it('result-card keeps the styled rows of a result card', () => {
    const line = read('streams', 'result-card.ndjson')
      .split('\n')
      .map((row) => (row.trim() ? (JSON.parse(row) as { message?: ChatMessage }) : {}))
      .find((event) => event.message?.kind === 'result')
    const card = line?.message as ResultMessage

    expect(card.icon).toBe('chart')
    expect(card.summary?.map((row) => row.style)).toEqual([
      'hero',
      'kpi',
      'kpi',
      'section',
      undefined,
      undefined,
    ])
    expect(card.summary?.[0]?.trend).toEqual({
      direction: 'up',
      text: '12%',
      tone: 'positive',
      note: 'so với kỳ trước',
    })
  })

  it('confirmation-card keeps the header and styled rows of a confirmation', () => {
    const card = read('streams', 'confirmation-card.ndjson')
      .split('\n')
      .map((row) => (row.trim() ? (JSON.parse(row) as { message?: ChatMessage }) : {}))
      .find((event) => event.message?.kind === 'confirmation')?.message as ConfirmationMessage

    expect(card).toMatchObject({
      subtitle: 'Trần Thị B · Kho chính',
      icon: 'cart',
      destructive: true,
    })
    expect(card.summary?.[0]).toMatchObject({ style: 'hero', badge: { text: 'Đã duyệt' } })
  })

  it('quick_action is a ConversationEvent', () => {
    const event: ConversationEvent = (
      JSON.parse(read('requests', 'quick_action.json')) as { event: ConversationEvent }
    ).event

    expect(event).toEqual({ type: 'quick_action', id: 'revenue-today' })
  })
})
