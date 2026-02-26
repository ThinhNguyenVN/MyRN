import type { StyleProp, ViewStyle } from 'react-native'
import type { ImageErrorEventData, ImageProps, ImageSource, ImageStyle } from 'expo-image'

import type { ElevationToken } from '@/theme/elevation'

export type MyImageElevation = ElevationToken | 'none'

export type MyImageSource = ImageSource | number

export interface MyImageProps {
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  url?: string
  source?: MyImageSource
  onPress?: () => void
  onLoadStart?: () => void
  onLoadEnd?: () => void
  onError?: (event?: ImageErrorEventData) => void
  showMessage?: boolean
  emptyMessage?: string
  errorMessage?: string
  elevation?: MyImageElevation
  cachePolicy?: ImageProps['cachePolicy']
  contentFit?: ImageProps['contentFit']
  emptyContent?: React.ReactNode
  errorContent?: React.ReactNode
  headers?: Record<string, string>
  priority?: ImageProps['priority']
  blurhash?: string
  placeholder?: ImageProps['placeholder']
}
