import React, { createContext, useCallback, useContext } from 'react'

export type SwipeableRowPressContextValue = {
  /** true → bỏ qua onPress (vừa swipe / menu đang mở). */
  shouldIgnorePress: () => boolean
}

const SwipeableRowPressContext = createContext<SwipeableRowPressContextValue | null>(null)

export function SwipeableRowPressProvider({
  value,
  children,
}: {
  value: SwipeableRowPressContextValue
  children: React.ReactNode
}) {
  return (
    <SwipeableRowPressContext.Provider value={value}>{children}</SwipeableRowPressContext.Provider>
  )
}

/**
 * Wrap content `onPress` so a swipe (or tap-to-close while open) does not navigate.
 * Safe outside SwipeableItem — falls through to `onPress`.
 */
export function useSwipeableItemPress(onPress?: () => void) {
  const ctx = useContext(SwipeableRowPressContext)

  return useCallback(() => {
    if (ctx?.shouldIgnorePress()) {
      return
    }
    onPress?.()
  }, [ctx, onPress])
}
