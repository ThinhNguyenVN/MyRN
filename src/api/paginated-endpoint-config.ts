import type { ServerListPagingData } from '@/hooks/use-server-list-paging'

type PaginatedArg = {
  page?: number
  isMobile?: boolean
}

/**
 * Shared config for a server-side paginated list `builder.query` endpoint — spread directly into
 * the endpoint definition: `{ query, transformResponse, ...paginatedEndpointConfig() }`.
 *
 * Drops `page` from the cache key (one cache entry per filter set, not per page) so RTK Query
 * becomes the single source of truth for the accumulating list — the feature does not need to keep
 * its own `accumulated` copy via `useState`/`useEffect` (that pattern used to flash the empty state
 * because it always lagged one render behind `data`/`isLoading` changing).
 *
 * - Desktop (`isMobile` falsy): every page REPLACES the whole cache — matches a 1/2/3-button
 *   pagination UI, and automatically reflects new data when a mutation invalidates the cache while
 *   viewing that page (no need to reset to page 1 — see `use-server-list-confirmed-action.ts`).
 * - Mobile (`isMobile` true): page 1 REPLACES (first mount / pull-to-refresh); a page beyond what's
 *   cached APPENDS (load more); a page that's already cached gets reconciled by `id` (an item
 *   already present is replaced with the fresh copy, a new one is appended) — it never infers
 *   position from `(page-1)*per_page` (a real bug: position-based math breaks when "load more" and
 *   a mutation-triggered invalidate happen close together, causing duplicate items). Matching by
 *   `id` stays correct no matter the arrival order or a mismatched `per_page`.
 */
export function paginatedEndpointConfig<
  Item extends { id: string },
  Arg extends PaginatedArg | void,
>() {
  return {
    serializeQueryArgs: ({
      queryArgs,
      endpointName,
    }: {
      queryArgs: Arg
      endpointName: string
    }): string => {
      if (!queryArgs || typeof queryArgs !== 'object') {
        return endpointName
      }
      const { page: _page, ...rest } = queryArgs as PaginatedArg
      return `${endpointName}-${JSON.stringify(rest)}`
    },
    merge: (
      currentCache: ServerListPagingData<Item>,
      newData: ServerListPagingData<Item>,
      { arg }: { arg: Arg },
    ): ServerListPagingData<Item> | void => {
      const isMobile = arg && typeof arg === 'object' ? Boolean(arg.isMobile) : false
      const page = arg && typeof arg === 'object' ? (arg.page ?? 1) : 1
      if (!isMobile || page <= 1) {
        return newData
      }
      if (page > currentCache.pagination.current_page) {
        // Brand new page (load more) — append at the end.
        currentCache.items.push(...newData.items)
        currentCache.pagination = newData.pagination
        return
      }
      // This page is ALREADY in the cache — either a duplicate fetch (e.g. a FlatList
      // `onEndReached` firing twice for one scroll threshold) OR a mutation just invalidated it so
      // it was refetched with FRESH data (e.g. status changed after approve/cancel). Don't try to
      // tell the two apart — reconcile by `id`: an item already present gets replaced by the fresh
      // copy (a duplicate fetch has identical content, so this is a no-op; genuinely new data gets
      // applied correctly), an unfamiliar id (rare, only when the underlying data actually shifted)
      // gets appended — position is never inferred, so there's no way to compute it wrong and
      // duplicate an item.
      const indexById = new Map(currentCache.items.map((item, index) => [item.id, index]))
      for (const freshItem of newData.items) {
        const existingIndex = indexById.get(freshItem.id)
        if (existingIndex === undefined) {
          currentCache.items.push(freshItem)
        } else {
          currentCache.items[existingIndex] = freshItem
        }
      }
      currentCache.pagination = {
        ...newData.pagination,
        current_page: Math.max(currentCache.pagination.current_page, page),
      }
    },
    forceRefetch: ({
      currentArg,
      previousArg,
    }: {
      currentArg: Arg | undefined
      previousArg: Arg | undefined
    }): boolean => JSON.stringify(currentArg) !== JSON.stringify(previousArg),
  }
}
