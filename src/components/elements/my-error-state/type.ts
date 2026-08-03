import type { StyleProp, ViewStyle } from 'react-native'

import type { ContainerStyleProps } from '@/types/styles'

export interface MyErrorStateProps extends ContainerStyleProps {
  title?: string
  message: string
  /** @default 'Retry' */
  retryLabel?: string
  onRetry: () => void
  style?: StyleProp<ViewStyle>
}
