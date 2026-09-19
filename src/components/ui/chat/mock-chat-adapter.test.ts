import type { ChatStreamHandlers } from './chat-adapter'
import { MockChatAdapter } from './mock-chat-adapter'
import type { ChatMessage, FormMessage } from './types'

function collectHandlers() {
  const calls: string[] = []
  const messages: ChatMessage[] = []
  const handlers: ChatStreamHandlers = {
    onMessageStart: (message) => {
      calls.push('start')
      messages.push(message)
    },
    onTextChunk: (_id, delta) => {
      calls.push(`chunk:${delta}`)
    },
    onMessage: (message) => {
      calls.push(`message:${message.kind}`)
      messages.push(message)
    },
    onError: () => {
      calls.push('error')
    },
    onDone: () => {
      calls.push('done')
    },
  }
  return { calls, messages, handlers }
}

async function runMockSend(...args: Parameters<typeof MockChatAdapter.send>): Promise<void> {
  const sendPromise = MockChatAdapter.send(...args)
  await jest.runAllTimersAsync()
  await sendPromise
}

describe('MockChatAdapter', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('streams text then emits an options message for a product-creation intent', async () => {
    const { calls, messages, handlers } = collectHandlers()

    await runMockSend({ event: { type: 'send_text', text: 'Tạo sản phẩm' }, history: [] }, handlers)

    expect(calls[0]).toBe('start')
    expect(calls[calls.length - 2]).toBe('message:options')
    expect(calls[calls.length - 1]).toBe('done')
    expect(messages.some((message) => message.kind === 'options')).toBe(true)
  })

  it('streams a plain echo response for unrelated text, without a structured message', async () => {
    const { calls, handlers } = collectHandlers()

    await runMockSend({ event: { type: 'send_text', text: 'xin chào' }, history: [] }, handlers)

    expect(calls[0]).toBe('start')
    expect(calls[calls.length - 1]).toBe('done')
    expect(calls.some((call) => call.startsWith('message:'))).toBe(false)
  })

  it('responds to select_option with a form message', async () => {
    const { messages, handlers } = collectHandlers()

    await runMockSend(
      { event: { type: 'select_option', messageId: 'opt1', optionId: 'phone' }, history: [] },
      handlers,
    )

    const form = messages.find((message) => message.kind === 'form')
    expect(form).toBeDefined()
  })

  it('responds to submit_form with a confirmation message reflecting the values', async () => {
    const { messages, handlers } = collectHandlers()

    await runMockSend(
      {
        event: {
          type: 'submit_form',
          messageId: 'form1',
          values: { name: 'iPhone 17 Pro', price: 30000000, stock: 10 },
        },
        history: [],
      },
      handlers,
    )

    const confirmation = messages.find((message) => message.kind === 'confirmation')
    expect(confirmation?.kind).toBe('confirmation')
    if (confirmation?.kind === 'confirmation') {
      expect(confirmation.summary?.[0].value).toBe('iPhone 17 Pro')
    }
  })

  it('responds to confirm(true) with a result message built from the form in history', async () => {
    const { messages, handlers } = collectHandlers()
    const formInHistory: FormMessage = {
      id: 'form1',
      role: 'assistant',
      createdAt: 0,
      status: 'complete',
      kind: 'form',
      fields: [],
      submittedValues: { name: 'iPhone 17 Pro', price: 30000000, stock: 10 },
    }

    await runMockSend(
      {
        event: { type: 'confirm', messageId: 'conf1', confirmed: true },
        history: [formInHistory],
      },
      handlers,
    )

    const result = messages.find((message) => message.kind === 'result')
    expect(result?.kind).toBe('result')
    if (result?.kind === 'result') {
      expect(result.actions?.length).toBeGreaterThan(0)
      expect(result.summary?.[0].value).toBe('iPhone 17 Pro')
    }
  })

  it('responds to confirm(false) without emitting a result message', async () => {
    const { calls, handlers } = collectHandlers()

    await runMockSend(
      { event: { type: 'confirm', messageId: 'conf1', confirmed: false }, history: [] },
      handlers,
    )

    expect(calls.some((call) => call === 'message:result')).toBe(false)
    expect(calls[calls.length - 1]).toBe('done')
  })
})
