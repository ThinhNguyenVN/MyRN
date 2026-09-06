import { useCallback } from 'react'

const DEFAULT_SERVER_LIST_PAGE_SIZE = 10

export type ServerPagination = {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

export type ServerListPagingData<T> = {
  items: T[]
  pagination: ServerPagination
}

type UseServerListPagingParams<T> = {
  /** Latest response — RTK Query (via `paginatedEndpointConfig`) already merged/replaced it
   * correctly for desktop (each page replaces) / mobile (appends); this hook only reads it back,
   * it does NOT keep its own copy. */
  data: ServerListPagingData<T> | undefined
  /** The feature owns `page` via `useState` and passes it in — this hook does not own that state
   * (the feature needs `page` BEFORE calling RTK Query, this hook only computes AFTER `data` exists). */
  page: number
  setPage: (page: number) => void
  pageSize?: number
}

type UseServerListPagingResult<T> = {
  pageSize: number
  total: number
  maxPage: number
  items: T[]
  hasMore: boolean
  /** Back to page 1 (e.g. screen refocus, pull-to-refresh) — RTK Query detects the `page` change
   * itself (`forceRefetch`) and merge replaces everything (page 1 always replaces), no manual
   * cleanup needed. */
  resetPaging: () => void
  onLoadMore: () => void
  onPrevPage: () => void
  onNextPage: () => void
  onPageChange: (nextPage: number) => void
}

/** Server-side counterpart of `useClientListPaging` — the feature calls RTK Query itself with
 * `page`/`pageSize`/`isMobile`, RTK Query (via `paginatedEndpointConfig`) merges the cache, this
 * hook only reads `data` back into `items`/`hasMore`/`maxPage`. */
export function useServerListPaging<T>({
  data,
  page,
  setPage,
  pageSize = DEFAULT_SERVER_LIST_PAGE_SIZE,
}: UseServerListPagingParams<T>): UseServerListPagingResult<T> {
  const total = data?.pagination.total ?? 0
  const maxPage = data?.pagination.last_page ?? 1
  const items = data?.items ?? []
  const hasMore = page < maxPage

  const onLoadMore = useCallback(() => {
    if (page < maxPage) {
      setPage(page + 1)
    }
  }, [maxPage, page, setPage])

  const onPrevPage = useCallback(() => {
    setPage(Math.max(1, page - 1))
  }, [page, setPage])

  const onNextPage = useCallback(() => {
    setPage(Math.min(maxPage, page + 1))
  }, [maxPage, page, setPage])

  const onPageChange = useCallback(
    (nextPage: number) => {
      setPage(Math.min(maxPage, Math.max(1, nextPage)))
    },
    [maxPage, setPage],
  )

  const resetPaging = useCallback(() => {
    setPage(1)
  }, [setPage])

  return {
    pageSize,
    total,
    maxPage,
    items,
    hasMore,
    resetPaging,
    onLoadMore,
    onPrevPage,
    onNextPage,
    onPageChange,
  }
}
