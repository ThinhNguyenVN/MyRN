import { paginatedEndpointConfig } from './paginated-endpoint-config'

type Item = { id: string; status?: string }
type Paged = {
  items: Item[]
  pagination: { total: number; per_page: number; current_page: number; last_page: number }
}

function page(items: number[], currentPage: number, lastPage = 3): Paged {
  return {
    items: items.map((id) => ({ id: String(id) })),
    pagination: {
      total: lastPage * 2,
      per_page: 2,
      current_page: currentPage,
      last_page: lastPage,
    },
  }
}

describe('paginatedEndpointConfig', () => {
  const config = paginatedEndpointConfig<
    Item,
    { page?: number; isMobile?: boolean; keyword?: string }
  >()

  describe('serializeQueryArgs', () => {
    it('drops `page` from the cache key — same filter, different page shares one cache entry', () => {
      const keyPage1 = config.serializeQueryArgs({
        queryArgs: { page: 1, isMobile: true, keyword: 'abc' },
        endpointName: 'getOrders',
      })
      const keyPage2 = config.serializeQueryArgs({
        queryArgs: { page: 2, isMobile: true, keyword: 'abc' },
        endpointName: 'getOrders',
      })
      expect(keyPage1).toBe(keyPage2)
    })

    it('a different filter (other than page) → different cache key', () => {
      const keyA = config.serializeQueryArgs({
        queryArgs: { page: 1, keyword: 'abc' },
        endpointName: 'getOrders',
      })
      const keyB = config.serializeQueryArgs({
        queryArgs: { page: 1, keyword: 'xyz' },
        endpointName: 'getOrders',
      })
      expect(keyA).not.toBe(keyB)
    })

    it('no queryArgs (void) → falls back to endpointName', () => {
      expect(
        config.serializeQueryArgs({
          queryArgs: undefined as unknown as { page?: number },
          endpointName: 'getOrders',
        }),
      ).toBe('getOrders')
    })
  })

  describe('merge', () => {
    it('desktop (isMobile falsy): always REPLACES, even beyond page 1 — no need to reset to page 1 to see fresh data after a mutation', () => {
      const current = page([1, 2], 1)
      const result = config.merge(current, page([3, 4], 2), { arg: { page: 2, isMobile: false } })
      expect(result).toEqual(page([3, 4], 2))
    })

    it('mobile page 1: REPLACES (first mount / pull-to-refresh)', () => {
      const current = page([1, 2, 3, 4], 2)
      const result = config.merge(current, page([9, 10], 1), { arg: { page: 1, isMobile: true } })
      expect(result).toEqual(page([9, 10], 1))
    })

    it('mobile page > 1: APPENDS to the existing cache (load more)', () => {
      const current = page([1, 2], 1)
      const returned = config.merge(current, page([3, 4], 2), { arg: { page: 2, isMobile: true } })
      // merge returns nothing when appending — it mutates currentCache directly (matches RTK Query's merge API)
      expect(returned).toBeUndefined()
      expect(current.items).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }])
      expect(current.pagination.current_page).toBe(2)
    })

    it('mobile: merging the exact same page again (double fetch) — does NOT duplicate items', () => {
      // Real bug: a FlatList `onEndReached` can fire twice for the same scroll threshold (or
      // refetchOnMountOrArgChange + forceRefetch both trigger) → two requests for the same page →
      // merge runs twice → items get duplicated → React warns about a duplicate key. Fixed by
      // reconciling by `id` (an existing item is replaced, a new one is appended) — identical
      // content is a no-op, independent of position/`per_page`.
      const current = page([1, 2, 3, 4], 2) // pages 1+2 already appended
      const returned = config.merge(current, page([3, 4], 2), { arg: { page: 2, isMobile: true } })

      expect(returned).toBeUndefined()
      expect(current.items).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }])
    })

    it('mobile: matches by id, NEVER infers position — stays correct even when per_page differs between fetches', () => {
      // Real bug: an earlier version computed position as (page-1)*per_page and spliced — that
      // broke when "load more" and a mutation-triggered invalidate happened close together, since
      // per_page/ordering no longer matched the assumption, duplicating items. Matching by `id` has
      // no notion of "position" so there's nothing to compute incorrectly.
      const current = page([1, 2, 3, 4, 5, 6], 3) // per_page was 2 previously
      // A fresh response for "page 2" but the actual per_page changed (e.g. the backend returned a
      // different limit) — id remains the only source of truth for matching, never per_page.
      const refreshed: Paged = {
        items: [{ id: '3', status: 'updated' }],
        pagination: { total: 6, per_page: 1, current_page: 2, last_page: 6 },
      }
      const returned = config.merge(current, refreshed, { arg: { page: 2, isMobile: true } })

      expect(returned).toBeUndefined()
      // id '3' is updated correctly, other ids stay put, nothing gets duplicated.
      const ids = current.items.map((item) => item.id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(current.items.find((item) => item.id === '3')).toEqual({
        id: '3',
        status: 'updated',
      })
    })

    it('mobile: an already-loaded page is refetched with FRESH data (after a mutation) — must update the item, not skip it', () => {
      // Real bug: approving/cancelling an order shown on an already-loaded page → mutation
      // invalidates → RTK Query refetches that exact page with the new status → an earlier version
      // that "skipped if current_page <= cache" mistook this for a duplicate fetch and discarded the
      // fresh data, leaving the old status on screen until the user manually reloaded.
      const current: Paged = {
        items: [
          { id: '1', status: 'active' },
          { id: '2', status: 'active' },
          { id: '3', status: 'active' },
          { id: '4', status: 'active' },
        ],
        pagination: { total: 6, per_page: 2, current_page: 2, last_page: 3 },
      }
      const refreshedPage2: Paged = {
        items: [
          { id: '3', status: 'cancelled' },
          { id: '4', status: 'active' },
        ],
        pagination: { total: 6, per_page: 2, current_page: 2, last_page: 3 },
      }

      const returned = config.merge(current, refreshedPage2, { arg: { page: 2, isMobile: true } })

      expect(returned).toBeUndefined()
      expect(current.items).toEqual([
        { id: '1', status: 'active' },
        { id: '2', status: 'active' },
        { id: '3', status: 'cancelled' },
        { id: '4', status: 'active' },
      ])
    })

    it('mobile: a stale response for an older page arrives late (current_page lower than cache) — does not duplicate or roll back the recorded current_page', () => {
      const current = page([1, 2, 3, 4, 5, 6], 3) // already appended through page 3
      const returned = config.merge(current, page([3, 4], 2), { arg: { page: 2, isMobile: true } })

      expect(returned).toBeUndefined()
      expect(current.items).toEqual([
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
        { id: '6' },
      ])
      // current_page must stay at 3 (not roll back to 2) — otherwise the next valid merge for page 3
      // would look like a new page again and duplicate it once more.
      expect(current.pagination.current_page).toBe(3)
    })

    it('empty/void arg defaults to page 1, desktop — replaces', () => {
      const current = page([1, 2], 1)
      const result = config.merge(current, page([9, 10], 1), {
        arg: undefined as unknown as { page?: number },
      })
      expect(result).toEqual(page([9, 10], 1))
    })
  })

  describe('forceRefetch', () => {
    it('returns true when arg changes (e.g. page increments) — forces a refetch even though the cache key is unchanged', () => {
      expect(
        config.forceRefetch({
          currentArg: { page: 2, isMobile: true },
          previousArg: { page: 1, isMobile: true },
        }),
      ).toBe(true)
    })

    it('returns false when arg is identical to last time', () => {
      expect(
        config.forceRefetch({
          currentArg: { page: 1, isMobile: true },
          previousArg: { page: 1, isMobile: true },
        }),
      ).toBe(false)
    })
  })
})
