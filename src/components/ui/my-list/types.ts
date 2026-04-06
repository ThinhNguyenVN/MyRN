import type { FlashListProps, FlashListRef } from '@shopify/flash-list'
import type { FlatList as RNFlatList } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'

export interface ListRenderItemInfo<T> {
  item: T
  index: number
}

export interface MyListProps<T> extends Omit<FlashListProps<T>, 'data' | 'renderItem'> {
  data: readonly T[] | null | undefined
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement | null
  onScrollEnd?: () => void
  refreshing?: boolean
  onRefresh?: () => void | Promise<void>
  enableLayoutAnimated?: boolean
}

/** FlashList hoặc RN FlatList tùy `enableLayoutAnimated`. */
export type MyListRef<T> = FlashListRef<T> | RNFlatList<T> | null

export interface UsePullToRefreshOptions {
  onRefresh?: () => void | Promise<void>
  refreshing?: boolean
  maxDistance?: number
  threshold?: number
}

export interface RefreshIndicatorProps {
  pullDistance: SharedValue<number>
  refreshing: boolean
  threshold?: number
  /** iOS: chiều cao cố định cho vùng indicator — tránh layout giật khi `pullDistance` đổi; khớp `paddingTop` list. */
  fixedLayoutSlotHeight?: number
}
