import type { StyleProp, ViewStyle } from 'react-native'

export type ImagePreviewProps = {
  images: string[]
  activeIndex: number
  visible: boolean
  label: string
  onClose: () => void
  onIndexChange: (index: number) => void
}

export type PreviewZoomableImageProps = {
  uri: string
  label: string
  index: number
  width: number
  height: number
  isActive: boolean
  onZoomChange: (zoomed: boolean) => void
  style?: StyleProp<ViewStyle>
}
