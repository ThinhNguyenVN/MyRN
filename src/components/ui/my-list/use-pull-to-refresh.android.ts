import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cancelAnimation, useSharedValue, withTiming } from 'react-native-reanimated'

import {
  PULL_TO_REFRESH_ANDROID_NATIVE_OFFSET_DP,
  PULL_TO_REFRESH_HIDE_DELAY_MS,
  PULL_TO_REFRESH_OVERSCROLL_THRESHOLD,
} from './constants'
import {
  getScrollOffsetY,
  type PullToRefreshControlPropsBundle,
  type PullToRefreshScrollProps,
  type UsePullToRefreshOptions,
  type UsePullToRefreshResult,
} from './utils'

const MAX_PULL_VISUAL_PX = 120
const ANDROID_PULL_STEP_PX = 1.75
const ANDROID_CLEAR_BELOW_Y = 10

export function usePullToRefresh({
  onRefresh,
  refreshing: refreshingProp,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const progress = useSharedValue(0)
  const pullDistance = useSharedValue(0)
  const [internalRefreshing, setInternalRefreshing] = useState(false)
  const [pullRefreshChromeActive, setPullRefreshChromeActive] = useState(false)
  const isControlled = refreshingProp !== undefined
  const refreshing = isControlled ? Boolean(refreshingProp) : internalRefreshing

  const draggingRef = useRef(false)
  const hapticFiredRef = useRef(false)
  const wasRefreshingRef = useRef(false)
  const androidPullAccumRef = useRef(0)
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  useEffect(() => {
    if (!refreshing) return
    hapticFiredRef.current = false
    cancelAnimation(pullDistance)
    cancelAnimation(progress)
  }, [refreshing, pullDistance, progress])

  const handleRefreshControlRefresh = useCallback(() => {
    setPullRefreshChromeActive(true)
    if (isControlled) {
      void Promise.resolve(onRefreshRef.current?.()).catch(() => {})
      return
    }
    setInternalRefreshing(true)
    Promise.resolve(onRefreshRef.current?.())
      .catch(() => {})
      .finally(() => {
        setTimeout(() => {
          setInternalRefreshing(false)
          setPullRefreshChromeActive(false)
          progress.value = withTiming(0, { duration: 200 })
          pullDistance.value = withTiming(0, { duration: 200 })
        }, PULL_TO_REFRESH_HIDE_DELAY_MS)
      })
  }, [isControlled, progress, pullDistance])

  useEffect(() => {
    if (!isControlled) return
    if (wasRefreshingRef.current && !refreshing) {
      const t = setTimeout(() => {
        setPullRefreshChromeActive(false)
        progress.value = withTiming(0, { duration: 200 })
        pullDistance.value = withTiming(0, { duration: 200 })
      }, PULL_TO_REFRESH_HIDE_DELAY_MS)
      wasRefreshingRef.current = refreshing
      return () => clearTimeout(t)
    }
    wasRefreshingRef.current = refreshing
  }, [isControlled, refreshing, progress, pullDistance])

  const onScroll = useCallback<PullToRefreshScrollProps['onScroll']>(
    (e) => {
      const y = getScrollOffsetY(e)
      if (y === undefined) return

      if (!refreshing && y > ANDROID_CLEAR_BELOW_Y) {
        androidPullAccumRef.current = 0
        pullDistance.value = 0
        progress.value = 0
        return
      }

      if (draggingRef.current && y <= 1 && !refreshing) {
        androidPullAccumRef.current = Math.min(
          MAX_PULL_VISUAL_PX,
          androidPullAccumRef.current + ANDROID_PULL_STEP_PX,
        )
        const d = androidPullAccumRef.current
        pullDistance.value = d
        progress.value = Math.min(d / PULL_TO_REFRESH_OVERSCROLL_THRESHOLD, 1)
      }
    },
    [refreshing, progress, pullDistance],
  )

  const onScrollBeginDrag = useCallback<PullToRefreshScrollProps['onScrollBeginDrag']>((e) => {
    draggingRef.current = true
    const y = getScrollOffsetY(e)
    if (y !== undefined && y <= 1) {
      androidPullAccumRef.current = 0
      pullDistance.value = 0
      progress.value = 0
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onScrollEndDrag = useCallback<PullToRefreshScrollProps['onScrollEndDrag']>(() => {
    draggingRef.current = false
    hapticFiredRef.current = false
    androidPullAccumRef.current = 0
    if (!refreshing) {
      progress.value = withTiming(0, { duration: 200 })
      pullDistance.value = withTiming(0, { duration: 200 })
    }
  }, [refreshing, progress, pullDistance])

  const scrollProps = useMemo<PullToRefreshScrollProps>(
    () => ({
      onScroll,
      onScrollBeginDrag,
      onScrollEndDrag,
      scrollEventThrottle: 16,
    }),
    [onScroll, onScrollBeginDrag, onScrollEndDrag],
  )

  const refreshControlProps = useMemo<PullToRefreshControlPropsBundle>(
    () => ({
      refreshing,
      onRefresh: handleRefreshControlRefresh,
      colors: ['#00000000'],
      progressBackgroundColor: '#00000000',
      progressViewOffset: PULL_TO_REFRESH_ANDROID_NATIVE_OFFSET_DP,
    }),
    [refreshing, handleRefreshControlRefresh],
  )

  return {
    refreshing,
    refreshingForPullIndicator: pullRefreshChromeActive && refreshing,
    progress,
    pullDistance,
    scrollProps,
    refreshControlProps,
    iosListTopInset: 0,
  }
}
