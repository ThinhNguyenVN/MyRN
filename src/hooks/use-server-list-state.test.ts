import { act, renderHook } from '@testing-library/react-native'
import { useCallback, useState } from 'react'

import { useServerListRefresh, useServerListSearchState } from './use-server-list-state'

// The real `useFocusEffect` pulls in a native module (expo-modules-core) that can't run under
// Jest — mock it to a no-op so the test isolates the plain handler logic (handleRefresh/
// handleRetry/isRefreshing), not the actual "screen refocus" behavior (there is no reasonable way
// to unit-test that part; no other test in this codebase covers `useFocusEffect` either).
jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }))

describe('useServerListSearchState', () => {
  it('handleSearchChange updates search and resets page to 1', () => {
    const { result } = renderHook(() => useServerListSearchState())

    expect(result.current.search).toBe('')
    expect(result.current.page).toBe(1)

    act(() => result.current.setPage(3))
    expect(result.current.page).toBe(3)

    act(() => result.current.handleSearchChange('abc'))
    expect(result.current.search).toBe('abc')
    expect(result.current.page).toBe(1)
  })

  it('handlePagingReset sets page back to 1, leaves search untouched', () => {
    const { result } = renderHook(() => useServerListSearchState())

    act(() => {
      result.current.setPage(5)
      result.current.handleSearchChange('xyz')
    })
    act(() => result.current.setPage(5))

    act(() => result.current.handlePagingReset())
    expect(result.current.page).toBe(1)
    expect(result.current.search).toBe('xyz')
  })
})

/**
 * The real `refetch` (RTK Query) dispatches a "pending" action synchronously as soon as it's
 * called — `isFetching` flips to `true` in the SAME event-processing tick as `setIsRefreshing(true)`
 * (React 18 batches them), so the effect that clears `isRefreshing` can't run against a stale
 * `isFetching`. This harness simulates that exactly (instead of an inert `jest.fn()`) so the test
 * doesn't flag a race that doesn't actually exist.
 */
function useHarness(resetPaging: () => void) {
  const [isFetching, setIsFetching] = useState(false)
  const refetch = useCallback(() => setIsFetching(true), [])
  const refresh = useServerListRefresh({ isFetching, refetch, resetPaging })
  return { ...refresh, isFetching, setIsFetching }
}

describe('useServerListRefresh', () => {
  it('handleRefresh: sets isRefreshing, calls resetPaging + refetch, clears itself when fetch finishes', () => {
    const resetPaging = jest.fn()
    const { result } = renderHook(() => useHarness(resetPaging))

    act(() => result.current.handleRefresh())

    expect(resetPaging).toHaveBeenCalledTimes(1)
    expect(result.current.isFetching).toBe(true)
    expect(result.current.isRefreshing).toBe(true)

    act(() => result.current.setIsFetching(false))
    expect(result.current.isRefreshing).toBe(false)
  })

  it('handleRetry only calls refetch, leaves isRefreshing/resetPaging untouched', () => {
    const resetPaging = jest.fn()
    const { result } = renderHook(() => useHarness(resetPaging))

    act(() => result.current.handleRetry())

    expect(result.current.isFetching).toBe(true)
    expect(resetPaging).not.toHaveBeenCalled()
    expect(result.current.isRefreshing).toBe(false)
  })
})
