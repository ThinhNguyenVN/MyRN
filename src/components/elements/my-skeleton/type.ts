import type { StyleProp, ViewStyle } from 'react-native'

import type { ContainerStyleProps } from '@/types/styles'

export type MySkeletonPreset = 'listRow' | 'textBlock' | 'card'

export interface SkeletonLayoutItem extends ViewStyle {
  key: string
  children?: SkeletonLayoutItem[]
}

export interface MySkeletonProps extends ContainerStyleProps {
  /** @default 'listRow' */
  preset?: MySkeletonPreset
  /** @default 1 */
  count?: number
  /** @default true */
  isLoading?: boolean
  style?: StyleProp<ViewStyle>
}
