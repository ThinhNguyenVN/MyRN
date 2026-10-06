import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

import type { ChatStreamHandlers } from './chat-adapter'
import { consumeNdjsonBuffer } from './http-chat-adapter'

jest.mock('@/utils/storage', () => ({
  storageGetItem: jest.fn(),
  storageSetItem: jest.fn(),
  storageRemoveItem: jest.fn(),
}))

const CONTRACT_DIR = join(__dirname, '../../../../contract')

interface Recorded {
  calls: string[]
  cardStates: { messageId: string; state: string }[]
}

function replay(file: string): Recorded {
  const recorded: Recorded = { calls: [], cardStates: [] }
  const handlers: ChatStreamHandlers = {
    onMessageStart: (message) => recorded.calls.push(`start:${message.id}`),
    onTextChunk: (id) => recorded.calls.push(`chunk:${id}`),
    onMessage: (message) => recorded.calls.push(`message:${message.id}`),
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

function streamFiles(version: 'v1' | 'v2'): string[] {
  const dir = join(CONTRACT_DIR, version, 'streams')
  return readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .map((name) => join(dir, name))
}

describe.each(['v1', 'v2'] as const)('contract %s streams', (version) => {
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
