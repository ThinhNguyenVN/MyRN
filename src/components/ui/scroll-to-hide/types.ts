import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'

export type ScrollToHideContextValue = {
  hideProgress: SharedValue<number>
  /** Measured height from header onLayout; use in worklets */
  measuredHeaderHeight: SharedValue<number>
  /** Measured height from footer onLayout; use in worklets */
  measuredFooterHeight: SharedValue<number>
  setMeasuredHeaderHeight: (height: number) => void
  setMeasuredFooterHeight: (height: number) => void
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  scrollEndHandler: () => void
  scrollEndDragHandler: () => void
  register: () => void
  unregister: () => void
  /** Fallback when not yet measured */
  headerHeight: number
  footerHeight: number
}

export type ScrollToHideProviderProps = {
  children: React.ReactNode
  headerHeight?: number
  footerHeight?: number
}

export type ScrollToHideHeaderProps = {
  children: React.ReactNode
  style?: any
}

export type ScrollToHideFooterProps = {
  children: React.ReactNode
  style?: any
}

export type ScrollToHideContentProps = {
  children: React.ReactElement
  scrollEventThrottle?: number
}
