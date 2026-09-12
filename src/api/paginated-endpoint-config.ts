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
 * - Mobile (`isMobile` true): page 1 REPLACES (first mount / pull-to-refresh); every page > 1
 *   reconciles by `id` then appends unknowns — including a "new" page. Never `push` a whole page:
 *   unstable `ORDER BY created` OFFSET paging can repeat an id from the previous page (duplicate
 *   React keys). It never infers position from `(page-1)*per_page`.
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
      // Every page > 1: upsert by `id`. Do not `push` a whole page — unstable `ORDER BY created`
      // (many rows share a timestamp) makes OFFSET repeat an id from the previous page.
      const indexById = new Map(currentCache.items.map((item, index) => [String(item.id), index]))
      for (const freshItem of newData.items) {
        const id = String(freshItem.id)
        const existingIndex = indexById.get(id)
        if (existingIndex === undefined) {
          currentCache.items.push(freshItem)
          indexById.set(id, currentCache.items.length - 1)
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
