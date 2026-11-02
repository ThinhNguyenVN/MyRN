import { act, renderHook } from '@testing-library/react-native'

import { Confirmation } from '@/components/ui/confirmation'

import { unsavedChanges } from './unsaved-changes-registry'
import { useUnsavedChangesGuard } from './use-unsaved-changes-guard'

type PreventCallback = (options: { data: { action: { type: string } } }) => void

const mockNavigation = {
  dispatch: jest.fn(),
  addListener: jest.fn(),
}
const mockPrevent: { enabled: boolean; callback: PreventCallback | null } = {
  enabled: false,
  callback: null,
}
let mockFocusListener: (() => void) | null = null

jest.mock('expo-router', () => ({ useNavigation: () => mockNavigation }))
jest.mock('expo-router/react-navigation', () => ({
  usePreventRemove: (enabled: boolean, callback: PreventCallback) => {
    mockPrevent.enabled = enabled
    mockPrevent.callback = callback
  },
}))
jest.mock('@/components/ui/confirmation', () => ({ Confirmation: { confirm: jest.fn() } }))
jest.mock('@/i18n', () => ({ i18n: { t: (key: string) => key } }))
jest.mock('./unsaved-changes-browser', () => ({ syncBrowserLeaveGuard: jest.fn() }))

const confirmMock = Confirmation.confirm as jest.Mock
const backAction = { data: { action: { type: 'GO_BACK' } } }

/** Lets `confirmDiscard().then(...)` settle. */
const flush = () => act(async () => {})

describe('useUnsavedChangesGuard', () => {
  beforeEach(() => {
    confirmMock.mockReset()
    mockNavigation.dispatch.mockReset()
    mockNavigation.addListener.mockReset()
    mockNavigation.addListener.mockImplementation((_event: string, listener: () => void) => {
      mockFocusListener = listener
      return () => undefined
    })
    mockPrevent.enabled = false
    mockPrevent.callback = null
  })

  it('does not prevent leaving a clean form', () => {
    const { unmount } = renderHook(() => useUnsavedChangesGuard(false))
    expect(mockPrevent.enabled).toBe(false)
    expect(unsavedChanges.isDirty()).toBe(false)
    unmount()
  })

  it('asks before a stack removal and leaves on "Discard"', async () => {
    confirmMock.mockResolvedValue(true)
    const { unmount } = renderHook(() => useUnsavedChangesGuard(true))
    expect(mockPrevent.enabled).toBe(true)
    expect(unsavedChanges.isDirty()).toBe(true)

    act(() => mockPrevent.callback?.(backAction))
    await flush()

    expect(confirmMock).toHaveBeenCalledTimes(1)
    expect(mockNavigation.dispatch).toHaveBeenCalledWith(backAction.data.action)
    expect(mockPrevent.enabled).toBe(false)
    unmount()
  })

  it('stays on "Stay"', async () => {
    confirmMock.mockResolvedValue(false)
    const { unmount } = renderHook(() => useUnsavedChangesGuard(true))

    act(() => mockPrevent.callback?.(backAction))
    await flush()

    expect(mockNavigation.dispatch).not.toHaveBeenCalled()
    expect(mockPrevent.enabled).toBe(true)
    unmount()
  })

  it('lets the leave through after a successful save (allowLeave in the same tick)', () => {
    const { unmount } = renderHook(() => useUnsavedChangesGuard(true))

    // Container: save ok → `unsavedChanges.allowLeave()` → `router.replace` before any re-render.
    const stalePreventCallback = mockPrevent.callback
    unsavedChanges.allowLeave()
    stalePreventCallback?.(backAction)

    expect(confirmMock).not.toHaveBeenCalled()
    expect(mockNavigation.dispatch).toHaveBeenCalledWith(backAction.data.action)
    unmount()
  })

  it('re-arms when the screen is focused again (form kept mounted under a push)', () => {
    const { unmount } = renderHook(() => useUnsavedChangesGuard(true))
    act(() => unsavedChanges.allowLeave())
    expect(mockPrevent.enabled).toBe(false)
    expect(unsavedChanges.isDirty()).toBe(false)

    act(() => mockFocusListener?.())
    expect(mockPrevent.enabled).toBe(true)
    expect(unsavedChanges.isDirty()).toBe(true)
    unmount()
  })

  it('unregisters on unmount', () => {
    const { unmount } = renderHook(() => useUnsavedChangesGuard(true))
    unmount()
    expect(unsavedChanges.isDirty()).toBe(false)
  })
})
