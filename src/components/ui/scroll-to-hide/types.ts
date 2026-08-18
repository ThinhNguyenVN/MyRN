import { StyleProp, ViewStyle } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'

export type ScrollToHideContextValue = {
  hideProgress: SharedValue<number>
  measuredHeaderHeight: SharedValue<number>
  measuredFooterHeight: SharedValue<number>
  setMeasuredHeaderHeight: (height: number) => void
  setMeasuredFooterHeight: (height: number) => void

  register: () => void
  unregister: () => void

  animatedScrollHandler: (event: any) => void
  childOnScrollRef: { current: ((e: any) => void) | undefined }
}

export type ScrollToHideProviderProps = {
  children: React.ReactNode
}

export type ScrollToHideHeaderProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export type ScrollToHideFooterProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

export type ScrollToHideContentProps = {
  children: React.ReactElement
  scrollEventThrottle?: number
}

export type ScrollToHideInsetProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}
