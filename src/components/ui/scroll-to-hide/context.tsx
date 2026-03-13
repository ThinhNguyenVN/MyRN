import { NAVIGATION_BAR_HEIGHT, TAB_BAR_HEIGHT } from '@/constants/dimensions'
import { useTheme } from '@/theme/theme-context'
import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import {
  Easing,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'

import type { ScrollToHideContextValue, ScrollToHideProviderProps } from './types'

const SCROLL_DISTANCE_FOR_FULL_HIDE = 90
const SNAP_DURATION_MS = 380
const SNAP_THRESHOLD = 0.5
const SNAP_NEAR_THRESHOLD = 0.08
const SHOW_VELOCITY_THRESHOLD = 80
const SHOW_UP_DY_THRESHOLD = 8
const SNAP_AFTER_DRAG_END_MS = 100

const SNAP_EASING = Easing.bezier(0.33, 1, 0.68, 1)
const TIMING_CONFIG = {
  duration: SNAP_DURATION_MS,
  easing: SNAP_EASING,
}

const ScrollToHideContext = createContext<ScrollToHideContextValue | null>(null)

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value))
}

export function ScrollToHideProvider({
  children,
  headerHeight = NAVIGATION_BAR_HEIGHT,
  footerHeight = TAB_BAR_HEIGHT,
}: ScrollToHideProviderProps) {
  const { insets } = useTheme()
  const hideProgress = useSharedValue(0)
  const effectiveHeaderHeight = headerHeight + (insets?.top ?? 0)
  const effectiveFooterHeight = footerHeight + (insets?.bottom ?? 0)
  const measuredHeaderHeight = useSharedValue(effectiveHeaderHeight)
  const measuredFooterHeight = useSharedValue(effectiveFooterHeight)
  const lastScrollY = useRef(0)
  const progressRef = useRef(0)
  const isRegistered = useRef(false)
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didTriggerShowThisGestureRef = useRef(false)

  const scrollHandler = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, velocity } = event.nativeEvent
      const y = contentOffset.y
      const dy = y - lastScrollY.current
      const vy = velocity?.y ?? 0
      lastScrollY.current = y

      if (!isRegistered.current) return
      if (y <= 0) {
        progressRef.current = 0
        hideProgress.value = 0
        return
      }

      if (dy > 0) {
        const sensitivity = 1 / SCROLL_DISTANCE_FOR_FULL_HIDE
        const delta = dy * sensitivity
        progressRef.current = clamp(0, 1, progressRef.current + delta)
        hideProgress.value = progressRef.current
        return
      }

      const fastScrollUp =
        vy < -SHOW_VELOCITY_THRESHOLD || dy < -SHOW_UP_DY_THRESHOLD
      if (fastScrollUp && !didTriggerShowThisGestureRef.current) {
        didTriggerShowThisGestureRef.current = true
        progressRef.current = 0
        hideProgress.value = withTiming(0, TIMING_CONFIG)
      }
    },
    [hideProgress],
  )

  const performSnap = useCallback(() => {
    didTriggerShowThisGestureRef.current = false
    if (!isRegistered.current) return
    const p = progressRef.current
    const target = p >= SNAP_THRESHOLD ? 1 : 0
    progressRef.current = target
    if (p <= SNAP_NEAR_THRESHOLD || p >= 1 - SNAP_NEAR_THRESHOLD) {
      hideProgress.value = target
    } else {
      hideProgress.value = withTiming(target, TIMING_CONFIG)
    }
  }, [hideProgress])

  const scrollEndHandler = useCallback(() => {
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current)
      snapTimeoutRef.current = null
    }
    performSnap()
  }, [performSnap])

  const scrollEndDragHandler = useCallback(() => {
    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
    snapTimeoutRef.current = setTimeout(() => {
      snapTimeoutRef.current = null
      performSnap()
    }, SNAP_AFTER_DRAG_END_MS)
  }, [performSnap])

  const register = useCallback(() => {
    isRegistered.current = true
  }, [])

  const unregister = useCallback(() => {
    isRegistered.current = false
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current)
      snapTimeoutRef.current = null
    }
    progressRef.current = 0
    hideProgress.value = withTiming(0, TIMING_CONFIG)
  }, [hideProgress])

  const setMeasuredHeaderHeight = useCallback((h: number) => {
    measuredHeaderHeight.value = h
  }, [measuredHeaderHeight])
  const setMeasuredFooterHeight = useCallback((h: number) => {
    measuredFooterHeight.value = h
  }, [measuredFooterHeight])

  const value = useMemo<ScrollToHideContextValue>(
    () => ({
      hideProgress,
      measuredHeaderHeight,
      measuredFooterHeight,
      setMeasuredHeaderHeight,
      setMeasuredFooterHeight,
      scrollHandler,
      scrollEndHandler,
      scrollEndDragHandler,
      register,
      unregister,
      headerHeight: effectiveHeaderHeight,
      footerHeight: effectiveFooterHeight,
    }),
    [
      hideProgress,
      measuredHeaderHeight,
      measuredFooterHeight,
      setMeasuredHeaderHeight,
      setMeasuredFooterHeight,
      scrollHandler,
      scrollEndHandler,
      scrollEndDragHandler,
      register,
      unregister,
      effectiveHeaderHeight,
      effectiveFooterHeight,
    ],
  )

  return (
    <ScrollToHideContext.Provider value={value}>
      {children}
    </ScrollToHideContext.Provider>
  )
}

export function useScrollToHide() {
  const ctx = useContext(ScrollToHideContext)
  return ctx ?? null
}
