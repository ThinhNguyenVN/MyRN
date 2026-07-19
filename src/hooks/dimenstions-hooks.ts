import { BREAKPOINT_DESKTOP, BREAKPOINT_SIDEBAR } from '@/constants/dimensions'
import { useSyncExternalStore } from 'react'
import { Dimensions, Platform } from 'react-native'

const subscribeToWindowDimensions = (onStoreChange: () => void) => {
  const subscription = Dimensions.addEventListener('change', onStoreChange)
  return () => subscription.remove()
}

const getWindowWidth = () => Dimensions.get('window').width
const getServerWindowWidth = () => 0

function useWindowWidth(): number {
  return useSyncExternalStore(subscribeToWindowDimensions, getWindowWidth, getServerWindowWidth)
}

export function useIsMobileSize(): boolean {
  return useWindowWidth() < BREAKPOINT_DESKTOP
}

export function useShowSidebar(): boolean {
  return useWindowWidth() >= BREAKPOINT_SIDEBAR
}

export function useIsMobile(): boolean {
  const isMobileSize = useIsMobileSize()
  return Platform.OS !== 'web' && isMobileSize
}
