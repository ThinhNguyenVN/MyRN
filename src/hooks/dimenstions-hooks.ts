import { BREAKPOINT_DESKTOP, BREAKPOINT_SIDEBAR } from '@/constants/dimensions'
import { useWindowDimensions } from 'react-native'

export function useIsMobileSize(): boolean {
  const { width } = useWindowDimensions()
  return width < BREAKPOINT_DESKTOP
}

/** True when width is enough to show sidebar (tablet / iPad and up). */
export function useShowSidebar(): boolean {
  const { width } = useWindowDimensions()
  return width >= BREAKPOINT_SIDEBAR
}
