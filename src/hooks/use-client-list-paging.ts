import { useCallback, useEffect, useMemo, useState } from 'react'

const DEFAULT_CLIENT_LIST_PAGE_SIZE = 10

type UseClientListPagingResult<T> = {
  page: number
  pageSize: number
  total: number
  pageItems: T[]
  hasMore: boolean
  resetPaging: () => void
  onLoadMore: () => void
  onPrevPage: () => void
  onNextPage: () => void
  onPageChange: (nextPage: number) => void
}

export function useClientListPaging<T>(
  items: T[],
  isMobile: boolean,
  pageSize = DEFAULT_CLIENT_LIST_PAGE_SIZE,
): UseClientListPagingResult<T> {
  const [page, setPage] = useState(1)
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const total = items.length
  const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1)

  const resetPaging = useCallback(() => {
    setPage(1)
    setVisibleCount(pageSize)
  }, [pageSize])

  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage)
    }
  }, [maxPage, page])

  useEffect(() => {
    if (visibleCount > total && total > 0) {
      setVisibleCount(total)
    }
  }, [total, visibleCount])

  const pageItems = useMemo(() => {
    if (isMobile) {
      return items.slice(0, visibleCount)
    }
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [isMobile, items, page, pageSize, visibleCount])

  const hasMore = isMobile && visibleCount < total

  const onLoadMore = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= total) {
        return prev
      }
      return Math.min(prev + pageSize, total)
    })
  }, [pageSize, total])

  const onPrevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1))
  }, [])

  const onNextPage = useCallback(() => {
    setPage((prev) => Math.min(maxPage, prev + 1))
  }, [maxPage])

  const onPageChange = useCallback(
    (nextPage: number) => {
      setPage(Math.min(maxPage, Math.max(1, nextPage)))
    },
    [maxPage],
  )

  return {
    page,
    pageSize,
    total,
    pageItems,
    hasMore,
    resetPaging,
    onLoadMore,
    onPrevPage,
    onNextPage,
    onPageChange,
  }
}
