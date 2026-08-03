import type { StyleProp, ViewStyle } from 'react-native'

import type { ContainerStyleProps } from '@/types/styles'

export interface MyEmptyStateProps extends ContainerStyleProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onActionPress?: () => void
  style?: StyleProp<ViewStyle>
}
