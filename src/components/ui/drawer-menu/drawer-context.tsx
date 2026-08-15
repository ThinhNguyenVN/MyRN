import { createContext, useContext } from 'react'

export type DrawerContextValue = {
  openDrawer: () => void
}

const DrawerContext = createContext<DrawerContextValue | null>(null)

export const DrawerProvider = DrawerContext.Provider

export function useOpenDrawer(): (() => void) | undefined {
  return useContext(DrawerContext)?.openDrawer
}
