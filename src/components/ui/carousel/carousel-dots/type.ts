import type { StyleProp, ViewStyle } from 'react-native'

export interface CarouselDotsProps {
  readonly count: number
  readonly activeIndex: number
  readonly onSelect: (index: number) => void
  readonly style?: StyleProp<ViewStyle>
  readonly dotStyle?: StyleProp<ViewStyle>
  readonly activeDotStyle?: StyleProp<ViewStyle>
}
