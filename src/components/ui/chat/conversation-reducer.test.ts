import { conversationReducer, initialConversationState } from './conversation-reducer'
import type {
  ChatMessage,
  ConfirmationMessage,
  FormMessage,
  OptionsMessage,
  TextMessage,
} from './types'

function textMessage(overrides: Partial<TextMessage> = {}): TextMessage {
  return {
    id: 'm1',
    role: 'assistant',
    createdAt: 0,
    status: 'pending',
    kind: 'text',
    text: '',
    ...overrides,
  }
}

function optionsMessage(overrides: Partial<OptionsMessage> = {}): OptionsMessage {
  return {
    id: 'opt1',
    role: 'assistant',
    createdAt: 0,
    status: 'complete',
    kind: 'options',
    prompt: 'Pick one',
    options: [{ id: 'a', label: 'A' }],
    ...overrides,
  }
}

function confirmationMessage(overrides: Partial<ConfirmationMessage> = {}): ConfirmationMessage {
  return {
    id: 'conf1',
    role: 'assistant',
    createdAt: 0,
    status: 'complete',
    kind: 'confirmation',
    prompt: 'Confirm?',
    ...overrides,
  }
}

function formMessage(overrides: Partial<FormMessage> = {}): FormMessage {
  return {
    id: 'form1',
    role: 'assistant',
    createdAt: 0,
    status: 'complete',
    kind: 'form',
    fields: [{ name: 'name', label: 'Name', type: 'text' }],
    ...overrides,
  }
}

describe('conversationReducer', () => {
  it('appends a message', () => {
    const state = initialConversationState()
    const next = conversationReducer(state, { type: 'append_message', message: textMessage() })
    expect(next.messages).toHaveLength(1)
  })

  it('resolves an options message once and ignores a second select', () => {
    const state = initialConversationState([optionsMessage()])
    const afterFirst = conversationReducer(state, {
      type: 'select_option',
      messageId: 'opt1',
      optionId: 'a',
    })
    const resolved = afterFirst.messages[0] as OptionsMessage
    expect(resolved.selectedOptionId).toBe('a')
    expect(resolved.status).toBe('complete')

    const afterSecond = conversationReducer(afterFirst, {
      type: 'select_option',
      messageId: 'opt1',
      optionId: 'b',
    })
    expect((afterSecond.messages[0] as OptionsMessage).selectedOptionId).toBe('a')
  })

  it('resolves a confirmation message and keeps it in history', () => {
    const state = initialConversationState([confirmationMessage()])
    const next = conversationReducer(state, {
      type: 'confirm',
      messageId: 'conf1',
      confirmed: true,
    })
    const resolved = next.messages[0] as ConfirmationMessage
    expect(resolved.resolution).toBe('confirmed')
    expect(resolved.status).toBe('complete')
    expect(next.messages).toHaveLength(1)
  })

  it('resolves a form message with submitted values', () => {
    const state = initialConversationState([formMessage()])
    const next = conversationReducer(state, {
      type: 'submit_form',
      messageId: 'form1',
      values: { name: 'iPhone' },
    })
    const resolved = next.messages[0] as FormMessage
    expect(resolved.submittedValues).toEqual({ name: 'iPhone' })
    expect(resolved.status).toBe('complete')
  })

  it('appends streaming chunks only to text messages, in order', () => {
    const state = initialConversationState([textMessage({ status: 'streaming' })])
    const afterFirst = conversationReducer(state, {
      type: 'append_chunk',
      messageId: 'm1',
      delta: 'Hello',
    })
    const afterSecond = conversationReducer(afterFirst, {
      type: 'append_chunk',
      messageId: 'm1',
      delta: ' world',
    })
    expect((afterSecond.messages[0] as TextMessage).text).toBe('Hello world')
  })

  it('replaces an existing message on set_message, or appends if missing', () => {
    const state = initialConversationState([textMessage()])
    const replaced = conversationReducer(state, {
      type: 'set_message',
      message: optionsMessage({ id: 'm1' }),
    })
    expect(replaced.messages).toHaveLength(1)
    expect(replaced.messages[0].kind).toBe('options')

    const appended = conversationReducer(replaced, {
      type: 'set_message',
      message: optionsMessage({ id: 'opt-new' }),
    })
    expect(appended.messages).toHaveLength(2)
  })

  it('sets a message to complete on done, unless it already errored', () => {
    const state = initialConversationState([textMessage({ status: 'streaming' })])
    const done = conversationReducer(state, { type: 'set_done', messageId: 'm1' })
    expect(done.messages[0].status).toBe('complete')
    expect(done.isSending).toBe(false)

    const errored = conversationReducer(state, {
      type: 'set_error',
      messageId: 'm1',
      error: { message: 'boom' },
    })
    const stillError = conversationReducer(errored, { type: 'set_done', messageId: 'm1' })
    expect(stillError.messages[0].status).toBe('error')
  })

  it('resets a message for retry, clearing error and text', () => {
    const state = initialConversationState([
      textMessage({ status: 'error', text: 'partial', error: { message: 'boom' } }),
    ])
    const next = conversationReducer(state, { type: 'reset_for_retry', messageId: 'm1' })
    const reset = next.messages[0] as ChatMessage & { text?: string }
    expect(reset.status).toBe('pending')
    expect(reset.error).toBeUndefined()
    expect(reset.text).toBe('')
  })
})
