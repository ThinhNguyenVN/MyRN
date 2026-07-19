import type { StyleProp, ViewStyle } from 'react-native'

export type ImageSliderProps = {
  images: string[]
  label: string
  aspectRatio?: number
  style?: StyleProp<ViewStyle>
}
