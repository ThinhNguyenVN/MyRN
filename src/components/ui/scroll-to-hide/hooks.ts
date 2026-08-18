import { useCallback, useEffect, useRef } from 'react'

import { useScrollToHide } from './context'

export type UseScrollToHideScrollBindingOptions = {
  /** When false, forwards scroll props unchanged and skips provider registration. */
  enabled?: boolean
  scrollEventThrottle?: number
  onScroll?: (event: unknown) => void
  onScrollBeginDrag?: (event: unknown) => void
  onScrollEndDrag?: (event: unknown) => void
}

export type UseScrollToHideScrollBindingResult = {
  isActive: boolean
  onScroll: ((event: unknown) => void) | undefined
  scrollEventThrottle: number
  onScrollBeginDrag: ((event: unknown) => void) | undefined
  onScrollEndDrag: ((event: unknown) => void) | undefined
}

/** Register scroll-to-hide and chain JS scroll callbacks behind the UI-thread handler. */
export function useScrollToHideScrollBinding({
  enabled = true,
  scrollEventThrottle = 16,
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
}: UseScrollToHideScrollBindingOptions = {}): UseScrollToHideScrollBindingResult {
  const ctx = useScrollToHide()
  const isActive = enabled && ctx !== null

  const onScrollRef = useRef(onScroll)
  const onScrollBeginDragRef = useRef(onScrollBeginDrag)
  const onScrollEndDragRef = useRef(onScrollEndDrag)
  onScrollRef.current = onScroll
  onScrollBeginDragRef.current = onScrollBeginDrag
  onScrollEndDragRef.current = onScrollEndDrag

  useEffect(() => {
    if (!isActive || !ctx) {
      return
    }
    ctx.register()
    ctx.childOnScrollRef.current = (event) => {
      onScrollRef.current?.(event)
    }
    return () => {
      ctx.unregister()
    }
  }, [ctx, isActive])

  const boundOnScrollBeginDrag = useCallback((event: unknown) => {
    onScrollBeginDragRef.current?.(event)
  }, [])

  const boundOnScrollEndDrag = useCallback((event: unknown) => {
    onScrollEndDragRef.current?.(event)
  }, [])

  if (!isActive || !ctx) {
    return {
      isActive: false,
      onScroll,
      scrollEventThrottle,
      onScrollBeginDrag,
      onScrollEndDrag,
    }
  }

  return {
    isActive: true,
    onScroll: ctx.animatedScrollHandler,
    scrollEventThrottle,
    onScrollBeginDrag: boundOnScrollBeginDrag,
    onScrollEndDrag: boundOnScrollEndDrag,
  }
}
