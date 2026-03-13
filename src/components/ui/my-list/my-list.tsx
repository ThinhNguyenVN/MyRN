import React, { forwardRef, useCallback, useEffect, useRef } from 'react'
import {
  FlashList,
  type FlashListRef,
  ListRenderItemInfo as FlashListRenderItemInfo,
} from '@shopify/flash-list'
import { Platform } from 'react-native'

import type { MyListProps, MyListRef } from './types'
import { useTheme } from '@/theme/theme-context'
import { generateStyles } from './styles'
import { isNil } from 'lodash'

const DEFAULT_DRAW_DISTANCE = 350
const DEFAULT_ON_END_REACHED_THRESHOLD = 0.5
const WEB_SCROLL_END_DEBOUNCE_MS = 120

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
    onScroll,
    onScrollEnd,
    scrollEventThrottle = 16,
    ...rest
  }: MyListProps<T>,
  ref: React.ForwardedRef<MyListRef<T>>,
) {
  const styles = generateStyles(useTheme())
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const wrappedRenderItem = useCallback(
    (info: FlashListRenderItemInfo<T>) => renderItem({ item: info.item, index: info.index }),
    [renderItem],
  )

  const isWeb = Platform.OS === 'web'
  const handleScroll = useCallback(
    (e: any) => {
      onScroll?.(e)
      if (isWeb && onScrollEnd) {
        if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current)
        scrollEndTimeoutRef.current = setTimeout(() => {
          scrollEndTimeoutRef.current = null
          onScrollEnd()
        }, WEB_SCROLL_END_DEBOUNCE_MS)
      }
    },
    [onScroll, onScrollEnd, isWeb],
  )

  useEffect(() => {
    return () => {
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current)
        scrollEndTimeoutRef.current = null
      }
    }
  }, [])

  const contentStyle = contentContainerStyle
    ? [styles.contentContainer, contentContainerStyle]
    : styles.contentContainer

  const safeRef = !isNil(ref) ? (ref as React.RefObject<FlashListRef<T>>) : undefined

  const scrollProps = isWeb && onScrollEnd ? { onScroll: handleScroll } : { onScroll }

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
      scrollEventThrottle={scrollEventThrottle}
      contentContainerStyle={contentStyle}
      style={style}
      {...scrollProps}
      {...rest}
    />
  )
}

export const MyList = forwardRef(MyListInner) as <T>(
  props: MyListProps<T> & { ref?: React.ForwardedRef<MyListRef<T>> },
) => React.ReactElement
