import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  FlashList,
  type FlashListRef,
  ListRenderItemInfo as FlashListRenderItemInfo,
} from '@shopify/flash-list'
import type { ListRenderItemInfo as RNListRenderItemInfo } from 'react-native'
import { RefreshControl, View } from 'react-native'
import Animated, { LinearTransition, type FlatListPropsWithLayout } from 'react-native-reanimated'
import { isNil, omit } from 'lodash'

import type { MyListProps, MyListRef } from './types'
import { useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from './styles'
import { RefreshIndicator } from './refresh-indicator'
import { PULL_TO_REFRESH_OVERSCROLL_THRESHOLD } from './constants'
import { usePullToRefresh } from './use-pull-to-refresh'
import { useScrollToHide } from '../scroll-to-hide'
import { isWeb } from '@/constants/dimensions'

const DEFAULT_DRAW_DISTANCE = 500
const DEFAULT_ON_END_REACHED_THRESHOLD = 0.5
const WEB_SCROLL_END_DEBOUNCE_MS = 120
const EMPTY_ARRAY: readonly any[] = Object.freeze([])

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as typeof FlashList

const LIST_ITEM_LAYOUT = LinearTransition.springify(200).damping(22).stiffness(260)

/** Props chỉ có trên FlashList — không truyền xuống RN FlatList. */
const REST_OMIT_FOR_FLAT_LIST: string[] = [
  'drawDistance',
  'onLoad',
  'overrideItemLayout',
  'getItemType',
  'overrideProps',
  'maxItemsInRecyclePool',
  'masonry',
  'optimizeItemArrangement',
  'onCommitLayoutEffect',
  'CellRendererComponent',
]

function MyListInner<T>(
  {
    data,
    renderItem,
    keyExtractor,
    drawDistance = DEFAULT_DRAW_DISTANCE,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    onEndReached,
    onEndReachedThreshold = DEFAULT_ON_END_REACHED_THRESHOLD,
    contentContainerStyle,
    style,
    onScroll,
    onScrollBeginDrag: userOnScrollBeginDrag,
    onScrollEndDrag: userOnScrollEndDrag,
    onScrollEnd,
    scrollEventThrottle = 16,
    refreshing,
    onRefresh,
    enableLayoutAnimated,
    ...rest
  }: MyListProps<T>,
  ref: React.ForwardedRef<MyListRef<T>>,
) {
  const styles = useThemedStyles(generateStyles)
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasPullToRefresh = !!onRefresh && !isWeb

  const pullToRefresh = usePullToRefresh({
    onRefresh: hasPullToRefresh ? onRefresh : undefined,
    refreshing: hasPullToRefresh ? refreshing : undefined,
  })

  const pullScrollRef = useRef(pullToRefresh.scrollProps)
  pullScrollRef.current = pullToRefresh.scrollProps

  const scrollToHideCtx = useScrollToHide()
  const hasScrollToHide = !isNil(scrollToHideCtx)

  const wrappedFlashRenderItem = useCallback(
    (info: FlashListRenderItemInfo<T>) => renderItem({ item: info.item, index: info.index }),
    [renderItem],
  )

  const flatListRenderItem = useCallback(
    (info: RNListRenderItemInfo<T>) => renderItem({ item: info.item, index: info.index }),
    [renderItem],
  )

  const handleScroll = useCallback(
    (e: any) => {
      if (hasPullToRefresh) pullScrollRef.current.onScroll(e)
      if (typeof onScroll === 'function') onScroll(e)
      if (isWeb && onScrollEnd) {
        if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current)
        scrollEndTimeoutRef.current = setTimeout(() => {
          scrollEndTimeoutRef.current = null
          onScrollEnd()
        }, WEB_SCROLL_END_DEBOUNCE_MS)
      }
    },
    [onScroll, onScrollEnd, hasPullToRefresh],
  )

  const handleScrollBeginDrag = useCallback(
    (e: any) => {
      if (hasPullToRefresh) pullScrollRef.current.onScrollBeginDrag(e)
      userOnScrollBeginDrag?.(e)
    },
    [hasPullToRefresh, userOnScrollBeginDrag],
  )

  const handleScrollEndDrag = useCallback(
    (e: any) => {
      if (hasPullToRefresh) pullScrollRef.current.onScrollEndDrag(e)
      userOnScrollEndDrag?.(e)
    },
    [hasPullToRefresh, userOnScrollEndDrag],
  )

  if (hasScrollToHide && hasPullToRefresh) {
    scrollToHideCtx.childOnScrollRef.current = handleScroll
  }

  const needsAnimatedFlashList = hasScrollToHide && !enableLayoutAnimated

  const needsJsCallback = hasPullToRefresh || (isWeb && onScrollEnd)
  let scrollProp: any
  if (hasScrollToHide && hasPullToRefresh) {
    scrollProp = scrollToHideCtx.animatedScrollHandler
  } else if (needsJsCallback) {
    scrollProp = handleScroll
  } else {
    scrollProp = onScroll
  }

  useEffect(() => {
    return () => {
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current)
        scrollEndTimeoutRef.current = null
      }
    }
  }, [])

  const contentStyle = useMemo(
    () =>
      contentContainerStyle
        ? [styles.contentContainer, contentContainerStyle]
        : styles.contentContainer,
    [styles.contentContainer, contentContainerStyle],
  )

  const refreshControlEl = useMemo(
    () =>
      hasPullToRefresh && !isWeb ? (
        <RefreshControl {...pullToRefresh.refreshControlProps} />
      ) : undefined,
    [hasPullToRefresh, pullToRefresh.refreshControlProps],
  )

  const listScrollThrottle = hasPullToRefresh
    ? pullToRefresh.scrollProps.scrollEventThrottle
    : scrollEventThrottle

  const safeData = data ?? (EMPTY_ARRAY as T[])
  const safeRef = !isNil(ref) ? ref : undefined

  const flashListProps = {
    ref: safeRef as React.Ref<FlashListRef<T>> | undefined,
    data: safeData,
    renderItem: wrappedFlashRenderItem,
    keyExtractor,
    drawDistance,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    onEndReached,
    onEndReachedThreshold,
    scrollEventThrottle: listScrollThrottle,
    contentContainerStyle: contentStyle,
    style,
    onScroll: scrollProp,
    onScrollBeginDrag: handleScrollBeginDrag,
    onScrollEndDrag: handleScrollEndDrag,
    ...(hasPullToRefresh && refreshControlEl ? { refreshControl: refreshControlEl } : {}),
    ...rest,
  }

  const restForFlatList = omit(rest, REST_OMIT_FOR_FLAT_LIST)

  const flatListProps = {
    ref: safeRef,
    data: safeData as readonly T[],
    renderItem: flatListRenderItem,
    keyExtractor,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    onEndReached: onEndReached ?? undefined,
    onEndReachedThreshold: onEndReachedThreshold ?? undefined,
    scrollEventThrottle: listScrollThrottle,
    contentContainerStyle: contentStyle,
    style,
    onScroll: scrollProp,
    onScrollBeginDrag: handleScrollBeginDrag,
    onScrollEndDrag: handleScrollEndDrag,
    itemLayoutAnimation: LIST_ITEM_LAYOUT,
    ...(hasPullToRefresh && refreshControlEl ? { refreshControl: refreshControlEl } : {}),
    ...restForFlatList,
  } as unknown as FlatListPropsWithLayout<T>

  let list: React.ReactElement

  if (enableLayoutAnimated) {
    list = <Animated.FlatList<T> {...flatListProps} />
  } else if (needsAnimatedFlashList) {
    list = <AnimatedFlashList<T> {...flashListProps} />
  } else {
    list = <FlashList<T> {...flashListProps} />
  }

  if (!hasPullToRefresh) return list

  return (
    <View style={styles.flex}>
      {list}
      <RefreshIndicator
        pullDistance={pullToRefresh.pullDistance}
        refreshing={pullToRefresh.refreshingForPullIndicator}
        threshold={PULL_TO_REFRESH_OVERSCROLL_THRESHOLD}
        fixedLayoutSlotHeight={
          pullToRefresh.iosListTopInset > 0 ? pullToRefresh.iosListTopInset : undefined
        }
      />
    </View>
  )
}

export const MyList = forwardRef(MyListInner) as <T>(
  props: MyListProps<T> & { ref?: React.ForwardedRef<MyListRef<T>> },
) => React.ReactElement
