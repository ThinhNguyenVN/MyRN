import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

import type { ContainerStyleProps } from '@/types/styles'
import type { MyViewProps } from '../my-view'

export type AnimatedType = 'opacity' | 'scale'

export interface MyPressableProps extends ContainerStyleProps {
  children: ReactNode
  onPress?: () => void
  disabled?: boolean
  scaleValue?: number
  scaleBySize?: boolean
  animatedType?: AnimatedType
  haptic?: boolean
  style?: StyleProp<ViewStyle>
  surfaceProps?: Partial<MyViewProps>
}
