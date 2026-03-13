import type { FlashListProps, FlashListRef } from '@shopify/flash-list'

export interface ListRenderItemInfo<T> {
  item: T
  index: number
}

export interface MyListProps<T> extends Omit<FlashListProps<T>, 'data' | 'renderItem'> {
  data: readonly T[] | null | undefined
  renderItem: (info: ListRenderItemInfo<T>) => React.ReactElement | null
  /** Called when scroll stops. On web (no onMomentumScrollEnd) MyList debounces onScroll and calls this. */
  onScrollEnd?: () => void
}

export type MyListRef<T> = FlashListRef<T> | null
