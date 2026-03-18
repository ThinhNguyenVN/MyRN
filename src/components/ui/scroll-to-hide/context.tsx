import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import {
  Easing,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import type { ScrollToHideContextValue, ScrollToHideProviderProps } from './types'
import { isWeb } from '@/constants/dimensions'

const SNAP_DURATION_MS = 380
const SNAP_THRESHOLD = 0.5
const SNAP_NEAR_THRESHOLD = 0.08
const WEB_SCROLL_END_DEBOUNCE_MS = 120

const SNAP_EASING = Easing.bezier(0.33, 1, 0.68, 1)
const TIMING_CONFIG = {
  duration: SNAP_DURATION_MS,
  easing: SNAP_EASING,
}

const ScrollToHideContext = createContext<ScrollToHideContextValue | null>(null)

export function ScrollToHideProvider({ children }: ScrollToHideProviderProps) {
  const hideProgress = useSharedValue(0)
  const measuredHeaderHeight = useSharedValue(0)
  const measuredFooterHeight = useSharedValue(0)
  const progressShared = useSharedValue(0)
  const lastScrollYShared = useSharedValue(0)
  const didTriggerShowShared = useSharedValue(0)
  // Debounce fastScrollUp trigger (Android can occasionally enter the branch twice).
  // 1 = cooling down, 0 = ready.
  const showCooldownShared = useSharedValue(0)
  const isActiveShared = useSharedValue(0)
  const isRegistered = useRef(false)
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const webScrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const childOnScrollRef = useRef<((e: any) => void) | undefined>(undefined)

  const callChildOnScroll = useCallback((e: any) => {
    childOnScrollRef.current?.(e)
  }, [])

  const performSnap = useCallback(() => {
    const didTriggerShow = didTriggerShowShared.value === 1
    if (!isRegistered.current) return
    const p = progressShared.value

    const target = didTriggerShow ? 0 : p >= SNAP_THRESHOLD ? 1 : 0
    progressShared.value = target

    if (p <= SNAP_NEAR_THRESHOLD || p >= 1 - SNAP_NEAR_THRESHOLD) {
      hideProgress.value = target
    } else {
      hideProgress.value = withTiming(target, TIMING_CONFIG)
    }
  }, [hideProgress, progressShared, didTriggerShowShared])

  const webScrollEndDebounced = useCallback(() => {
    if (webScrollEndTimeoutRef.current) clearTimeout(webScrollEndTimeoutRef.current)
    webScrollEndTimeoutRef.current = setTimeout(() => {
      webScrollEndTimeoutRef.current = null
      performSnap()
    }, WEB_SCROLL_END_DEBOUNCE_MS)
  }, [performSnap])

  const register = useCallback(() => {
    isRegistered.current = true
    isActiveShared.value = 1
  }, [isActiveShared])

  const unregister = useCallback(() => {
    isRegistered.current = false
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current)
      snapTimeoutRef.current = null
    }
    if (webScrollEndTimeoutRef.current) {
      clearTimeout(webScrollEndTimeoutRef.current)
      webScrollEndTimeoutRef.current = null
    }
    isActiveShared.value = 0
    progressShared.value = 0
    hideProgress.value = withTiming(0, TIMING_CONFIG)
  }, [hideProgress, progressShared, isActiveShared])

  const setMeasuredHeaderHeight = useCallback(
    (h: number) => {
      measuredHeaderHeight.value = h
    },
    [measuredHeaderHeight],
  )
  const setMeasuredFooterHeight = useCallback(
    (h: number) => {
      measuredFooterHeight.value = h
    },
    [measuredFooterHeight],
  )

  const animatedScrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (e) => {
        'worklet'
        runOnJS(callChildOnScroll)(e)
        if (isActiveShared.value === 0) return
        const y = e.contentOffset.y
        const dy = y - lastScrollYShared.value
        lastScrollYShared.value = y
        const vy = e.velocity?.y ?? 0

        if (y <= 0) {
          progressShared.value = 0
          hideProgress.value = 0
          didTriggerShowShared.value = 0
          showCooldownShared.value = 0
          return
        }
        if (dy > 0) {
          // User is scrolling down again -> clear "show" latch.
          didTriggerShowShared.value = 0
          showCooldownShared.value = 0
          const sensitivity = 1 / 90
          const next = progressShared.value + dy * sensitivity
          progressShared.value = next <= 0 ? 0 : next >= 1 ? 1 : next
          hideProgress.value = progressShared.value
          return
        }
        const velThreshold = 80
        const dyThreshold = 8
        const fastScrollUp = vy < -velThreshold || dy < -dyThreshold
        if (fastScrollUp && didTriggerShowShared.value === 0 && showCooldownShared.value < 0.5) {
          didTriggerShowShared.value = 1
          showCooldownShared.value = 1
          // Cooldown window: prevent occasional double trigger.
          showCooldownShared.value = withTiming(0, { duration: 300 })
          progressShared.value = 0
          hideProgress.value = withTiming(0, { duration: 300 })
        }
        if (isWeb) runOnJS(webScrollEndDebounced)()
      },
      onEndDrag: () => {
        'worklet'
        if (!isWeb) runOnJS(performSnap)()
      },
      onMomentumEnd: () => {
        'worklet'
        if (!isWeb) runOnJS(performSnap)()
      },
    },
    [
      hideProgress,
      progressShared,
      lastScrollYShared,
      didTriggerShowShared,
      isActiveShared,
      performSnap,
      isWeb,
      webScrollEndDebounced,
      callChildOnScroll,
    ],
  )

  const value = useMemo<ScrollToHideContextValue>(
    () => ({
      hideProgress,
      measuredHeaderHeight,
      measuredFooterHeight,
      setMeasuredHeaderHeight,
      setMeasuredFooterHeight,
      register,
      unregister,
      animatedScrollHandler,
      childOnScrollRef,
    }),
    [
      hideProgress,
      measuredHeaderHeight,
      measuredFooterHeight,
      setMeasuredHeaderHeight,
      setMeasuredFooterHeight,
      register,
      unregister,
      animatedScrollHandler,
      childOnScrollRef,
    ],
  )

  return <ScrollToHideContext.Provider value={value}>{children}</ScrollToHideContext.Provider>
}

export function useScrollToHide() {
  const ctx = useContext(ScrollToHideContext)
  return ctx ?? null
}
