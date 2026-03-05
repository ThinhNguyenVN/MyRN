import { BREAKPOINT_DESKTOP, BREAKPOINT_SIDEBAR } from '@/constants/dimensions'
import { Platform, useWindowDimensions } from 'react-native'

export function useIsMobileSize(): boolean {
  const { width } = useWindowDimensions()
  return width < BREAKPOINT_DESKTOP
}

export function useShowSidebar(): boolean {
  const { width } = useWindowDimensions()
  return width >= BREAKPOINT_SIDEBAR
}

export function useIsMobile(): boolean {
  const isMobileSize = useIsMobileSize()
  return Platform.OS !== 'web' && isMobileSize
}
