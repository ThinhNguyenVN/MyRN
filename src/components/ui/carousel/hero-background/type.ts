import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native'

export interface HeroBackgroundProps {
  readonly images: readonly ImageSourcePropType[]
  readonly currentSlide: number
  readonly style?: StyleProp<ViewStyle>
}
