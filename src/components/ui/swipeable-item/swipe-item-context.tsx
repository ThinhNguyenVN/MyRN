import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react'

import type {
  SwipeableItemCloseFn,
  SwipeableItemContextValue,
  SwipeableItemProviderProps,
} from './types'

const SwipeableItemContext = createContext<SwipeableItemContextValue | null>(null)

export function SwipeableItemProvider({ children }: SwipeableItemProviderProps) {
  const activeKeyRef = useRef<string | null>(null)
  const closeActiveRef = useRef<SwipeableItemCloseFn | null>(null)

  const onRowPanBegin = useCallback((rowKey: string, closeThisRow: SwipeableItemCloseFn) => {
    if (activeKeyRef.current !== null && activeKeyRef.current !== rowKey) {
      closeActiveRef.current?.()
    }
    activeKeyRef.current = rowKey
    closeActiveRef.current = closeThisRow
  }, [])

  const value = useMemo(() => ({ onRowPanBegin }), [onRowPanBegin])

  return <SwipeableItemContext.Provider value={value}>{children}</SwipeableItemContext.Provider>
}

export function useSwipeableItemOptional(): SwipeableItemContextValue | null {
  return useContext(SwipeableItemContext)
}
