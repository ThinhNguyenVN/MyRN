import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

import type { ChatStreamHandlers } from './chat-adapter'
import type { ChatMessage, ConversationEvent } from './types'
import { consumeNdjsonBuffer } from './http-chat-adapter'

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

function streamFiles(version: 'v1' | 'v2' | 'v3'): string[] {
  const dir = join(CONTRACT_DIR, version, 'streams')
  return readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .map((name) => join(dir, name))
}

describe.each(['v1', 'v2', 'v3'] as const)('contract %s streams', (version) => {
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
