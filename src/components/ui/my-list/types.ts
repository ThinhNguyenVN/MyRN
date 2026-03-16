import type { FlashListProps, FlashListRef } from '@shopify/flash-list'
import type { SharedValue } from 'react-native-reanimated'

export interface ListRenderItemInfo<T> {
  item: T
  index: number
}

export interface MyListProps<T> extends Omit<FlashListProps<T>, 'data' | 'renderItem'> {
  data: readonly T[] | null | undefined
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement | null
  /** Called when scroll stops. On web (no onMomentumScrollEnd) MyList debounces onScroll and calls this. */
  onScrollEnd?: () => void
  /** Pull-to-refresh: controlled refreshing state from parent. */
  refreshing?: boolean
  /** Pull-to-refresh: called when user pulls past threshold. */
  onRefresh?: () => void | Promise<void>
}

export type MyListRef<T> = FlashListRef<T> | null

export interface UsePullToRefreshOptions {
  onRefresh?: () => void | Promise<void>
  /** When provided, refreshing is controlled externally (MyList mode).
   *  When omitted, the hook manages refreshing internally via Promise (standalone mode). */
  refreshing?: boolean
  maxDistance?: number
  threshold?: number
}

export interface RefreshIndicatorProps {
  pullDistance: SharedValue<number>
  refreshing: boolean
  threshold?: number
}
