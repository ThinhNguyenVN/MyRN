import { renderHook } from '@testing-library/react-native'

import { usePendingPrompt, type ChatPendingPrompt } from './use-pending-prompt'

describe('usePendingPrompt', () => {
  it('sends a new prompt once', () => {
    const send = jest.fn()
    const { rerender } = renderHook(
      ({ prompt }: { prompt?: ChatPendingPrompt }) => usePendingPrompt(prompt, send),
      { initialProps: { prompt: { id: '1', text: 'Create a product' } } },
    )
    rerender({ prompt: { id: '1', text: 'Create a product' } })
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith('Create a product')
  })

  it('sends the same text again under a new id', () => {
    const send = jest.fn()
    const { rerender } = renderHook(
      ({ prompt }: { prompt?: ChatPendingPrompt }) => usePendingPrompt(prompt, send),
      { initialProps: { prompt: { id: '1', text: 'This week sales' } } },
    )
    rerender({ prompt: { id: '2', text: 'This week sales' } })
    expect(send).toHaveBeenCalledTimes(2)
  })

  it('does nothing without a prompt', () => {
    const send = jest.fn()
    renderHook(() => usePendingPrompt(undefined, send))
    expect(send).not.toHaveBeenCalled()
  })
})
