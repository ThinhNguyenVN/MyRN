import { BREAKPOINT_DESKTOP } from '@/constants/dimensions'
import { useWindowDimensions } from 'react-native'

export function useIsMobileSize(): boolean {
  const { width } = useWindowDimensions()
  return width < BREAKPOINT_DESKTOP
}
