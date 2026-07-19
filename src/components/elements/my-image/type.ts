import type { StyleProp, ViewStyle } from 'react-native'
import type {
  ImageErrorEventData,
  ImageLoadEventData,
  ImageProps,
  ImageSource,
  ImageStyle,
} from 'expo-image'

import type { ElevationToken } from '@/theme/elevation'
import type { ContainerStyleProps } from '@/types/styles'

export type MyImageElevation = ElevationToken | 'none'

export type MyImageSource = ImageSource | number

export interface MyImageProps extends ContainerStyleProps {
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  url?: string
  source?: MyImageSource
  onPress?: () => void
  onLoadStart?: () => void
  onLoad?: (event: ImageLoadEventData) => void
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
