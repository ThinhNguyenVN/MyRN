import React, { forwardRef, useCallback } from 'react'
import {
  FlashList,
  type FlashListRef,
  ListRenderItemInfo as FlashListRenderItemInfo,
} from '@shopify/flash-list'

import type { MyListProps, MyListRef } from './types'
import { useTheme } from '@/theme/theme-context'
import { generateStyles } from './styles'
import { isNil } from 'lodash'

const DEFAULT_DRAW_DISTANCE = 350
const DEFAULT_ON_END_REACHED_THRESHOLD = 0.5

function MyListInner<T>(
  {
    data,
    renderItem,
    keyExtractor,

    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    onEndReached,
    onEndReachedThreshold = DEFAULT_ON_END_REACHED_THRESHOLD,
    contentContainerStyle,
    style,
    ...rest
  }: MyListProps<T>,
  ref: React.ForwardedRef<MyListRef<T>>,
) {
  const styles = generateStyles(useTheme())
  const wrappedRenderItem = useCallback(
    (info: FlashListRenderItemInfo<T>) => renderItem({ item: info.item, index: info.index }),
    [renderItem],
  )

  const contentStyle = contentContainerStyle
    ? [styles.contentContainer, contentContainerStyle]
    : styles.contentContainer

  const safeRef = !isNil(ref) ? (ref as React.RefObject<FlashListRef<T>>) : undefined

  return (
    <FlashList<T>
      ref={safeRef}
      data={data ?? []}
      renderItem={wrappedRenderItem}
      keyExtractor={keyExtractor}
      drawDistance={DEFAULT_DRAW_DISTANCE}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      contentContainerStyle={contentStyle}
      style={style}
      {...rest}
    />
  )
}

export const MyList = forwardRef(MyListInner) as <T>(
  props: MyListProps<T> & { ref?: React.ForwardedRef<MyListRef<T>> },
) => React.ReactElement
