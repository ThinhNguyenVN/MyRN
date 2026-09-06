import { act, renderHook } from '@testing-library/react-native'
import { useState } from 'react'

import { useServerListPaging, type ServerListPagingData } from './use-server-list-paging'

function page(items: number[], lastPage = 3): ServerListPagingData<number> {
  return {
    items,
    pagination: { total: lastPage * 2, per_page: 2, current_page: 1, last_page: lastPage },
  }
}

/** Wraps the hook the way a real feature would: owns `page` itself via `useState`. */
function useHarness(data: ServerListPagingData<number> | undefined) {
  const [page, setPage] = useState(1)
  const paging = useServerListPaging({ data, page, setPage })
  return { ...paging, page }
}

describe('useServerListPaging', () => {
  it('reads items/total/maxPage/hasMore straight from data — keeps no copy of its own', () => {
    const { result, rerender } = renderHook(
      (props: { data?: ServerListPagingData<number> }) => useHarness(props.data),
      { initialProps: { data: page([1, 2], 3) } },
    )

    expect(result.current.items).toEqual([1, 2])
    expect(result.current.total).toBe(6)
    expect(result.current.maxPage).toBe(3)
    expect(result.current.hasMore).toBe(true)

    act(() => result.current.onNextPage())
    // RTK Query (via paginatedEndpointConfig) already merged before returning `data` — this hook
    // only reads `data.items` back, it does not accumulate or compute anything further.
    rerender({ data: page([1, 2, 3, 4], 3) })

    expect(result.current.page).toBe(2)
    expect(result.current.items).toEqual([1, 2, 3, 4])
  })

  it('onPageChange clamps to [1, maxPage]', () => {
    const { result } = renderHook(() => useHarness(page([1, 2], 3)))

    act(() => result.current.onPageChange(99))
    expect(result.current.page).toBe(3)

    act(() => result.current.onPageChange(-5))
    expect(result.current.page).toBe(1)
  })

  it('onNextPage/onPrevPage step correctly and clamp at both edges', () => {
    const { result } = renderHook(() => useHarness(page([1, 2], 2)))

    act(() => result.current.onPrevPage())
    expect(result.current.page).toBe(1)

    act(() => result.current.onNextPage())
    expect(result.current.page).toBe(2)

    act(() => result.current.onNextPage())
    expect(result.current.page).toBe(2)
  })

  it('resetPaging() sets page back to 1', () => {
    const { result } = renderHook(() => useHarness(page([1, 2], 3)))

    act(() => result.current.onNextPage())
    expect(result.current.page).toBe(2)

    act(() => result.current.resetPaging())
    expect(result.current.page).toBe(1)
  })

  it('no data yet (loading): returns empty items, total 0, maxPage 1, hasMore false', () => {
    const { result } = renderHook(() => useHarness(undefined))

    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.maxPage).toBe(1)
    expect(result.current.hasMore).toBe(false)
  })
})
