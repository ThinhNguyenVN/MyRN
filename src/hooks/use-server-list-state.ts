import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'

/**
 * The "search + page" half of a server-side list screen — call this BEFORE building the query args
 * (the feature needs `page` to call RTK Query). Symmetric with `useServerListRefresh` (called AFTER,
 * needs `refetch`/`isFetching` from RTK Query) — the two hooks are split apart because of that
 * ordering constraint (see `use-server-list-paging.ts`).
 */
export function useServerListSearchState() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const handlePagingReset = useCallback(() => setPage(1), [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  return { search, page, setPage, handlePagingReset, handleSearchChange }
}

type UseServerListRefreshParams = {
  isFetching: boolean
  refetch: () => void
  /** Usually `paging.resetPaging` from `useServerListPaging`. */
  resetPaging: () => void
}

/**
 * The "pull-to-refresh + refetch on focus + retry" half of a server-side list screen — call this
 * AFTER `refetch`/`isFetching` from RTK Query (and `resetPaging` from `useServerListPaging`) exist.
 */
export function useServerListRefresh({
  isFetching,
  refetch,
  resetPaging,
}: UseServerListRefreshParams) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      resetPaging()
      void refetch()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetch]),
  )

  useEffect(() => {
    if (isFetching) {
      return
    }
    if (!isRefreshing) {
      return
    }
    setIsRefreshing(false)
  }, [isFetching, isRefreshing])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    resetPaging()
    void refetch()
  }, [refetch, resetPaging])

  const handleRetry = useCallback(() => {
    void refetch()
  }, [refetch])

  return { isRefreshing, handleRefresh, handleRetry }
}
