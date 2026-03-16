import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  FlashList,
  type FlashListRef,
  ListRenderItemInfo as FlashListRenderItemInfo,
} from '@shopify/flash-list'
import { Platform, StyleSheet, View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

import type { MyListProps, MyListRef } from './types'
import { useThemedStyles } from '@/theme/theme-context'
import { generateStyles } from './styles'
import { usePullToRefresh } from './hooks'
import { RefreshIndicator } from './refresh-indicator'
import { useScrollToHide } from '../scroll-to-hide'
import { isNil } from 'lodash'

const DEFAULT_DRAW_DISTANCE = 500
const DEFAULT_ON_END_REACHED_THRESHOLD = 0.5
const WEB_SCROLL_END_DEBOUNCE_MS = 120
const EMPTY_ARRAY: readonly any[] = Object.freeze([])

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as typeof FlashList

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
    onScrollEnd,
    scrollEventThrottle = 16,
    refreshing,
    onRefresh,
    ...rest
  }: MyListProps<T>,
  ref: React.ForwardedRef<MyListRef<T>>,
) {
  const styles = useThemedStyles(generateStyles)
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasPullToRefresh = !!onRefresh

  const pull = usePullToRefresh({ onRefresh, refreshing })

  const scrollToHideCtx = useScrollToHide()
  const hasScrollToHide = !isNil(scrollToHideCtx)

  const wrappedRenderItem = useCallback(
    (info: FlashListRenderItemInfo<T>) => renderItem({ item: info.item, index: info.index }),
    [renderItem],
  )

  const isWeb = Platform.OS === 'web'

  const pullScrollHandlerRef = useRef(pull.scrollHandler)
  pullScrollHandlerRef.current = pull.scrollHandler

  const handleScroll = useCallback(
    (e: any) => {
      if (hasPullToRefresh) pullScrollHandlerRef.current(e)
      if (typeof onScroll === 'function') onScroll(e)
      if (isWeb && onScrollEnd) {
        if (scrollEndTimeoutRef.current) clearTimeout(scrollEndTimeoutRef.current)
        scrollEndTimeoutRef.current = setTimeout(() => {
          scrollEndTimeoutRef.current = null
          onScrollEnd()
        }, WEB_SCROLL_END_DEBOUNCE_MS)
      }
    },
    [onScroll, onScrollEnd, isWeb, hasPullToRefresh],
  )

  if (hasScrollToHide && hasPullToRefresh) {
    scrollToHideCtx.childOnScrollRef.current = handleScroll
  }

  // Only use AnimatedFlashList when an animated scroll handler is required
  // (Reanimated's useAnimatedScrollHandler needs it). Regular FlashList is lighter.
  const needsAnimatedList = hasScrollToHide

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

  const safeData = data ?? (EMPTY_ARRAY as T[])
  const safeRef = !isNil(ref) ? (ref as React.RefObject<FlashListRef<T>>) : undefined

  const listProps = {
    ref: safeRef,
    data: safeData,
    renderItem: wrappedRenderItem,
    keyExtractor,
    drawDistance,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    onEndReached,
    onEndReachedThreshold,
    scrollEventThrottle,
    contentContainerStyle: contentStyle,
    style,
    onScroll: scrollProp,
    ...(hasPullToRefresh && { bounces: false, overScrollMode: 'never' as const }),
    ...rest,
  }

  const list = needsAnimatedList ? (
    <AnimatedFlashList<T> {...listProps} />
  ) : (
    <FlashList<T> {...listProps} />
  )

  if (!hasPullToRefresh) return list

  return (
    <GestureDetector gesture={pull.gesture}>
      <View style={styles.flex}>
        <RefreshIndicator pullDistance={pull.pullDistance} refreshing={pull.refreshing} />
        <Animated.View style={[StyleSheet.absoluteFill, pull.listStyle]}>{list}</Animated.View>
      </View>
    </GestureDetector>
  )
}

export const MyList = forwardRef(MyListInner) as <T>(
  props: MyListProps<T> & { ref?: React.ForwardedRef<MyListRef<T>> },
) => React.ReactElement
