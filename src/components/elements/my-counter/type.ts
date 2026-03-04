import type { StyleProp, ViewStyle } from 'react-native'

import type { ContainerStyleProps } from '@/types/styles'

export interface MyCounterProps extends Omit<ContainerStyleProps, 'width' | 'height'> {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}
