import { act, renderHook } from '@testing-library/react-native'

import { Confirmation } from '@/components/ui/confirmation'
import { Toast } from '@/components/ui/toast'

import { useServerListConfirmedAction } from './use-server-list-confirmed-action'

jest.mock('@/components/ui/confirmation', () => ({
  Confirmation: { confirm: jest.fn() },
}))
jest.mock('@/components/ui/toast', () => ({
  Toast: { show: jest.fn() },
}))

const confirmMock = Confirmation.confirm as jest.Mock
const toastShowMock = Toast.show as jest.Mock

const baseParams = {
  title: 'Delete order?',
  message: 'Are you sure you want to delete it?',
  confirmText: 'Delete',
  successText: 'Deleted',
  errorText: 'Delete failed',
}

describe('useServerListConfirmedAction', () => {
  beforeEach(() => {
    confirmMock.mockReset()
    toastShowMock.mockReset()
  })

  it('user cancels the confirm dialog → action is not called, no toast', async () => {
    confirmMock.mockResolvedValue(false)
    const action = jest.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useServerListConfirmedAction())

    await act(async () => {
      await result.current({ ...baseParams, action })
    })

    expect(action).not.toHaveBeenCalled()
    expect(toastShowMock).not.toHaveBeenCalled()
  })

  it('action succeeds, no onSuccess passed (desktop) → just toasts, no error', async () => {
    confirmMock.mockResolvedValue(true)
    const action = jest.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useServerListConfirmedAction())

    await act(async () => {
      await result.current({ ...baseParams, action })
    })

    expect(action).toHaveBeenCalledTimes(1)
    expect(toastShowMock).toHaveBeenCalledWith({ text: 'Deleted', type: 'success' })
  })

  it('action succeeds, onSuccess passed (mobile: paging.resetPaging) → called after action, before toast', async () => {
    confirmMock.mockResolvedValue(true)
    const action = jest.fn().mockResolvedValue(undefined)
    const onSuccess = jest.fn()
    const { result } = renderHook(() => useServerListConfirmedAction(onSuccess))

    await act(async () => {
      await result.current({ ...baseParams, action })
    })

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('action fails → onSuccess is NOT called, toasts the error with the API message', async () => {
    confirmMock.mockResolvedValue(true)
    const action = jest.fn().mockRejectedValue({ message: 'Order was already approved' })
    const onSuccess = jest.fn()
    const { result } = renderHook(() => useServerListConfirmedAction(onSuccess))

    await act(async () => {
      await result.current({ ...baseParams, action })
    })

    expect(onSuccess).not.toHaveBeenCalled()
    expect(toastShowMock).toHaveBeenCalledWith({
      text: 'Order was already approved',
      type: 'error',
    })
  })

  it('action fails with no usable message → falls back to errorText', async () => {
    confirmMock.mockResolvedValue(true)
    const action = jest.fn().mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useServerListConfirmedAction())

    await act(async () => {
      await result.current({ ...baseParams, action })
    })

    expect(toastShowMock).toHaveBeenCalledWith({ text: 'Delete failed', type: 'error' })
  })
})
