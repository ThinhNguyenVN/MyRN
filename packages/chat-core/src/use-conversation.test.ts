import { act, renderHook } from '@testing-library/react-native'

import type { ChatAdapter, ChatRequest } from './chat-adapter'
import type { ChatMediaFile, ChatMessage, ImageMessage } from './types'
import { useConversation } from './use-conversation'

const files: ChatMediaFile[] = [
  { uri: 'file:///a.jpg', name: 'a.jpg', mimeType: 'image/jpeg' },
  { uri: 'file:///b.jpg', name: 'b.jpg', mimeType: 'image/jpeg' },
]

function fakeAdapter(overrides: Partial<ChatAdapter> = {}) {
  const requests: ChatRequest[] = []
  const adapter: ChatAdapter = {
    contractVersion: 3,
    uploadMedia: jest.fn(async (file: ChatMediaFile) => ({
      id: `id-${file.name}`,
      kind: 'image' as const,
    })),
    send: jest.fn(async (request: ChatRequest, handlers) => {
      requests.push(request)
      handlers.onDone('none')
    }),
    ...overrides,
  }
  return { adapter, requests }
}

async function flush() {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('useConversation.sendMedia', () => {
  it('shows the photos at once, uploads them, then sends send_media with the ids', async () => {
    const { adapter, requests } = fakeAdapter()
    const { result } = renderHook(() => useConversation({ adapter }))

    act(() => result.current.sendMedia(files, 'note milk'))
    expect(result.current.messages[0]).toMatchObject({ kind: 'image', status: 'pending' })
    await flush()

    expect(requests[0]?.event).toEqual({
      type: 'send_media',
      media: [
        { id: 'id-a.jpg', kind: 'image' },
        { id: 'id-b.jpg', kind: 'image' },
      ],
      caption: 'note milk',
    })
    const sent = result.current.messages[0] as ImageMessage
    expect(sent.status).toBe('complete')
    expect(sent.mediaIds).toEqual(['id-a.jpg', 'id-b.jpg'])
    expect(sent.imageUris).toEqual(['file:///a.jpg', 'file:///b.jpg'])
  })

  it('a failed upload marks the message failed; retry uploads only what is missing', async () => {
    let failB = true
    const uploadMedia = jest.fn(async (file: ChatMediaFile) => {
      if (file.name === 'b.jpg' && failB) throw new Error('HTTP 413')
      return { id: `id-${file.name}`, kind: 'image' as const }
    })
    const { adapter, requests } = fakeAdapter({ uploadMedia })
    const { result } = renderHook(() => useConversation({ adapter }))

    act(() => result.current.sendMedia(files))
    await flush()

    expect(requests).toEqual([])
    expect(result.current.messages[0]).toMatchObject({
      status: 'error',
      error: { message: 'HTTP 413' },
    })
    expect(result.current.isSending).toBe(false)

    failB = false
    act(() => result.current.retry(result.current.messages[0]!.id))
    await flush()

    expect(uploadMedia.mock.calls.map(([file]) => file.name)).toEqual(['a.jpg', 'b.jpg', 'b.jpg'])
    expect(requests[0]?.event.type).toBe('send_media')
    expect(result.current.messages[0]).toMatchObject({ status: 'complete' })
  })

  it.each([
    ['the adapter cannot upload', { uploadMedia: undefined }],
    ['the contract is below 3', { contractVersion: 2 }],
  ])('keeps send_images when %s', async (_label, overrides) => {
    const { adapter, requests } = fakeAdapter(overrides)
    const { result } = renderHook(() => useConversation({ adapter }))

    act(() => result.current.sendMedia(files))
    await flush()

    expect(requests[0]?.event).toEqual({
      type: 'send_images',
      imageUris: ['file:///a.jpg', 'file:///b.jpg'],
      caption: undefined,
    })
  })
})

describe('useConversation.selectMedia', () => {
  it('records the pick and sends select_media', async () => {
    const { adapter, requests } = fakeAdapter()
    const { result } = renderHook(() =>
      useConversation({
        adapter,
        initialMessages: [
          {
            id: 'mc1',
            role: 'assistant',
            createdAt: 0,
            status: 'complete',
            kind: 'media_choice',
            prompt: 'Pick',
            media: ['a', 'b'],
            min: 0,
            max: 1,
          },
        ],
      }),
    )

    act(() => result.current.selectMedia('mc1', ['b']))
    await flush()

    expect(requests[0]?.event).toEqual({ type: 'select_media', messageId: 'mc1', mediaIds: ['b'] })
    expect(result.current.messages[0]).toMatchObject({ selectedMediaIds: ['b'] })
  })
})

function typingCount(messages: ChatMessage[]) {
  return messages.filter(
    (message) =>
      message.role === 'assistant' &&
      message.kind === 'text' &&
      message.status === 'pending' &&
      message.text === '',
  ).length
}

let replyId = 0

/** Each call starts an assistant reply that stays typing until `finish` (ok, or fail). */
function controlledAdapter() {
  const calls: { finish: (ok: boolean) => void }[] = []
  const adapter: ChatAdapter = {
    send: jest.fn(
      (_request: ChatRequest, handlers) =>
        new Promise<void>((resolve) => {
          const id = `reply-${++replyId}`
          handlers.onMessageStart({
            id,
            role: 'assistant',
            createdAt: 0,
            status: 'pending',
            kind: 'text',
            text: '',
          })
          calls.push({
            finish: (ok) => {
              if (ok) {
                handlers.onTextChunk(id, 'ok')
              } else {
                handlers.onError(id, { message: 'boom' })
              }
              handlers.onDone(id)
              resolve()
            },
          })
        }),
    ),
  }
  return { adapter, calls }
}

describe('useConversation.retry', () => {
  it('an error leaves no typing row', () => {
    const { adapter, calls } = controlledAdapter()
    const { result } = renderHook(() => useConversation({ adapter }))

    act(() => result.current.send('hi'))
    expect(typingCount(result.current.messages)).toBe(1)
    act(() => calls[0]!.finish(false))

    expect(typingCount(result.current.messages)).toBe(0)
    expect(result.current.messages.filter((message) => message.status === 'error')).toHaveLength(1)
  })

  it('retrying four times never stacks typing rows and ends with one error', () => {
    const { adapter, calls } = controlledAdapter()
    const { result } = renderHook(() => useConversation({ adapter }))

    act(() => result.current.send('hi'))
    act(() => calls[0]!.finish(false))

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const failed = result.current.messages.find((message) => message.status === 'error')!
      act(() => result.current.retry(failed.id))
      expect(typingCount(result.current.messages)).toBe(1)
      act(() => calls[attempt]!.finish(false))
      expect(typingCount(result.current.messages)).toBe(0)
    }

    expect(adapter.send).toHaveBeenCalledTimes(5)
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages.filter((message) => message.status === 'error')).toHaveLength(1)
  })

  it('a retry that succeeds replaces the error with the answer', () => {
    const { adapter, calls } = controlledAdapter()
    const { result } = renderHook(() => useConversation({ adapter }))

    act(() => result.current.send('hi'))
    act(() => calls[0]!.finish(false))
    act(() => result.current.retry(result.current.messages[1]!.id))
    act(() => calls[1]!.finish(true))

    expect(typingCount(result.current.messages)).toBe(0)
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1]).toMatchObject({ status: 'complete', text: 'ok' })
  })

  it('ignores retry while a request is running', () => {
    const { adapter, calls } = controlledAdapter()
    const { result } = renderHook(() => useConversation({ adapter }))

    act(() => result.current.send('hi'))
    act(() => calls[0]!.finish(false))
    const failedId = result.current.messages[1]!.id
    act(() => result.current.retry(failedId))
    act(() => result.current.retry(failedId))

    expect(adapter.send).toHaveBeenCalledTimes(2)
    expect(typingCount(result.current.messages)).toBe(1)
  })

  it('a finishing turn keeps the typing row of a turn still running', () => {
    const { adapter, calls } = controlledAdapter()
    const { result } = renderHook(() =>
      useConversation({
        adapter,
        initialMessages: [
          {
            id: 'opt1',
            role: 'assistant',
            createdAt: 0,
            status: 'complete',
            kind: 'options',
            prompt: 'Pick',
            options: [{ id: 'a', label: 'A' }],
          },
        ],
      }),
    )

    act(() => result.current.send('hi'))
    act(() => result.current.selectOption('opt1', 'a'))
    expect(typingCount(result.current.messages)).toBe(2)
    act(() => calls[0]!.finish(true))
    expect(typingCount(result.current.messages)).toBe(1)
    act(() => calls[1]!.finish(true))
    expect(typingCount(result.current.messages)).toBe(0)
  })
})
