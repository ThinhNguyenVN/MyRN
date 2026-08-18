import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cancelAnimation, useSharedValue, withTiming } from 'react-native-reanimated'

import { triggerHaptic } from '@/utils/haptic'
import {
  PULL_TO_REFRESH_IOS_CLEAR_AFTER_REFRESH_MS,
  PULL_TO_REFRESH_IOS_CLEAR_AFTER_RELEASE_MS,
  PULL_TO_REFRESH_IOS_RESET_BELOW_Y,
  PULL_TO_REFRESH_HIDE_DELAY_MS,
  PULL_TO_REFRESH_IOS_TOP_INSET_PX,
  PULL_TO_REFRESH_MAX_PULL_VISUAL_PX,
  PULL_TO_REFRESH_OVERSCROLL_THRESHOLD,
} from './constants'
import {
  getScrollOffsetY,
  type PullToRefreshControlPropsBundle,
  type PullToRefreshScrollProps,
  type UsePullToRefreshOptions,
  type UsePullToRefreshResult,
} from './utils'

export function usePullToRefresh({
  onRefresh,
  refreshing: refreshingProp,
}: UsePullToRefreshOptions): UsePullToRefreshResult {
  const progress = useSharedValue(0)
  const pullDistance = useSharedValue(0)
  const [internalRefreshing, setInternalRefreshing] = useState(false)
  const [iosListTopInset, setIosListTopInset] = useState(0)
  const [pullRefreshChromeActive, setPullRefreshChromeActive] = useState(false)
  const isControlled = refreshingProp !== undefined
  const refreshing = isControlled ? Boolean(refreshingProp) : internalRefreshing

  const draggingRef = useRef(false)
  const hapticFiredRef = useRef(false)
  const wasRefreshingRef = useRef(false)
  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  const iosReleaseHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSlotVisibleRef = useRef(false)
  const prevRefreshingWhenPullActiveRef = useRef(false)

  const pullRefreshChromeActiveRef = useRef(false)
  useEffect(() => {
    pullRefreshChromeActiveRef.current = pullRefreshChromeActive
  }, [pullRefreshChromeActive])

  const showSlot = useCallback(() => {
    if (isSlotVisibleRef.current) return
    isSlotVisibleRef.current = true
    setIosListTopInset(PULL_TO_REFRESH_IOS_TOP_INSET_PX)
  }, [])

  const hideSlot = useCallback(() => {
    if (!isSlotVisibleRef.current) return
    isSlotVisibleRef.current = false
    setIosListTopInset(0)
  }, [])

  const scheduleSlotHide = useCallback(
    (delayMs: number, onDone?: () => void) => {
      if (iosReleaseHoldTimerRef.current) clearTimeout(iosReleaseHoldTimerRef.current)
      showSlot()
      iosReleaseHoldTimerRef.current = setTimeout(() => {
        iosReleaseHoldTimerRef.current = null
        hideSlot()
        onDone?.()
      }, delayMs)
    },
    [showSlot, hideSlot],
  )

  useEffect(
    () => () => {
      if (!iosReleaseHoldTimerRef.current) return
      clearTimeout(iosReleaseHoldTimerRef.current)
      iosReleaseHoldTimerRef.current = null
      hideSlot()
    },
    [hideSlot],
  )

  useEffect(() => {
    if (!pullRefreshChromeActive) {
      prevRefreshingWhenPullActiveRef.current = refreshing
      return
    }
    const prev = prevRefreshingWhenPullActiveRef.current
    prevRefreshingWhenPullActiveRef.current = refreshing
    if (!prev || refreshing) return
    scheduleSlotHide(PULL_TO_REFRESH_IOS_CLEAR_AFTER_REFRESH_MS, () => {
      setPullRefreshChromeActive(false)
    })
  }, [refreshing, pullRefreshChromeActive, scheduleSlotHide])

  useEffect(() => {
    if (!refreshing) return
    hapticFiredRef.current = false
    cancelAnimation(pullDistance)
    cancelAnimation(progress)
  }, [refreshing, pullDistance, progress])

  const handleRefreshControlRefresh = useCallback(() => {
    if (iosReleaseHoldTimerRef.current) {
      clearTimeout(iosReleaseHoldTimerRef.current)
      iosReleaseHoldTimerRef.current = null
    }
    hideSlot()
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
          progress.value = withTiming(0, { duration: 200 })
          pullDistance.value = withTiming(0, { duration: 200 })
        }, PULL_TO_REFRESH_HIDE_DELAY_MS)
      })
  }, [isControlled, progress, pullDistance, hideSlot])

  useEffect(() => {
    if (!isControlled) return
    if (wasRefreshingRef.current && !refreshing) {
      const t = setTimeout(() => {
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

      if (y < 0) {
        const d = Math.min(-y, PULL_TO_REFRESH_MAX_PULL_VISUAL_PX)
        pullDistance.value = d
        const p = Math.min(d / PULL_TO_REFRESH_OVERSCROLL_THRESHOLD, 1)
        progress.value = p
        if (p >= 1 && !hapticFiredRef.current && !refreshing) {
          hapticFiredRef.current = true
          triggerHaptic('Light')
        }
      } else if (
        !refreshing &&
        !pullRefreshChromeActiveRef.current &&
        progress.value < 1 &&
        y > PULL_TO_REFRESH_IOS_RESET_BELOW_Y &&
        !draggingRef.current
      ) {
        pullDistance.value = 0
        progress.value = 0
        hapticFiredRef.current = false
      }
    },
    [refreshing, progress, pullDistance],
  )

  const onScrollBeginDrag = useCallback<PullToRefreshScrollProps['onScrollBeginDrag']>(() => {
    draggingRef.current = true
  }, [])

  const onScrollEndDrag = useCallback<PullToRefreshScrollProps['onScrollEndDrag']>(() => {
    draggingRef.current = false
    hapticFiredRef.current = false
    if (refreshing) return
    const d = pullDistance.value
    const readyToRefresh = progress.value >= 1
    if (d >= PULL_TO_REFRESH_IOS_TOP_INSET_PX && readyToRefresh) {
      setPullRefreshChromeActive(true)
      pullDistance.value = Math.max(d, PULL_TO_REFRESH_OVERSCROLL_THRESHOLD)
      progress.value = 1
      scheduleSlotHide(PULL_TO_REFRESH_IOS_CLEAR_AFTER_RELEASE_MS)
    }
  }, [refreshing, progress, pullDistance, scheduleSlotHide])

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
      tintColor: 'transparent',
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
    iosListTopInset,
  }
}
