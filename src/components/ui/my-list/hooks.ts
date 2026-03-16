import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import type { SharedValue } from 'react-native-reanimated'

import type { UsePullToRefreshOptions } from './types'

export const PULL_MAX_DISTANCE = 150
export const PULL_THRESHOLD = 75

export function usePullToRefresh({
  onRefresh,
  refreshing: refreshingProp,
  maxDistance = PULL_MAX_DISTANCE,
  threshold = PULL_THRESHOLD,
}: UsePullToRefreshOptions) {
  const isControlled = refreshingProp !== undefined

  const scrollY = useSharedValue(0)
  const pullDistance: SharedValue<number> = useSharedValue(0)
  const isReady = useSharedValue(0)
  const refreshingShared = useSharedValue(0)
  const prevTouchY = useSharedValue(0)

  const [internalRefreshing, setInternalRefreshing] = useState(false)
  const refreshing = isControlled ? refreshingProp : internalRefreshing

  const onRefreshRef = useRef(onRefresh)
  onRefreshRef.current = onRefresh

  const prevRefreshing = useRef(false)
  useEffect(() => {
    const was = prevRefreshing.current
    prevRefreshing.current = refreshing

    if (refreshing && !was) {
      refreshingShared.value = 1
    } else if (!refreshing && was) {
      setTimeout(() => {
        pullDistance.value = withTiming(0, { duration: 300 })
        refreshingShared.value = 0
      }, 800)
    }
  }, [refreshing, pullDistance, refreshingShared])

  const triggerRefresh = useCallback(() => {
    if (isControlled) {
      onRefreshRef.current?.()
    } else {
      setInternalRefreshing(true)
      Promise.resolve(onRefreshRef.current?.()).finally(() => {
        setInternalRefreshing(false)
      })
    }
  }, [isControlled])

  // manualActivation keeps Pan in BEGAN state (not claiming touches) until
  // we call activate(). This lets the native ScrollView inside FlashList
  // handle scrolling freely on Android. We only activate when the user is
  // at the top of the list and pulling downward.
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .manualActivation(true)
        .onTouchesDown((e) => {
          'worklet'
          if (e.changedTouches.length > 0) {
            prevTouchY.value = e.changedTouches[0].y
          }
        })
        .onTouchesMove((e, stateManager) => {
          'worklet'
          if (e.changedTouches.length === 0) return

          const currentY = e.changedTouches[0].y
          const dy = currentY - prevTouchY.value
          prevTouchY.value = currentY

          const atTop = scrollY.value <= 1
          if (dy > 0 && (atTop || refreshingShared.value === 1)) {
            stateManager.activate()
          }
        })
        .onUpdate((e) => {
          'worklet'
          if (scrollY.value > 0) return

          if (refreshingShared.value === 1) {
            const val = Math.min(Math.max(0, threshold + e.translationY), maxDistance)
            pullDistance.value = val
            return
          }

          const val = Math.min(Math.max(0, e.translationY), maxDistance)
          pullDistance.value = val
          isReady.value = val >= threshold ? 1 : 0
        })
        .onEnd(() => {
          'worklet'
          if (refreshingShared.value === 1) {
            pullDistance.value = withTiming(threshold, { duration: 180 })
            return
          }
          if (isReady.value === 1) {
            isReady.value = 0
            refreshingShared.value = 1
            pullDistance.value = withTiming(threshold, { duration: 180 })
            runOnJS(triggerRefresh)()
          } else {
            isReady.value = 0
            pullDistance.value = withTiming(0, { duration: 180 })
          }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maxDistance, threshold, triggerRefresh],
  )

  const scrollHandler = useCallback(
    (e: any) => {
      const y = e?.contentOffset?.y ?? e?.nativeEvent?.contentOffset?.y ?? 0
      scrollY.value = y
    },
    [scrollY],
  )

  const listStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullDistance.value }],
  }))

  return {
    pullDistance,
    refreshing,
    gesture: panGesture,
    scrollHandler,
    listStyle,
    threshold,
    maxDistance,
  }
}
