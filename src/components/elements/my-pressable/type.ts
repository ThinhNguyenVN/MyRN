import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

import type { MySurfaceProps } from '../my-surface'

export type AnimatedType = 'opacity' | 'scale'

export interface MyPressableProps {
  children: ReactNode
  onPress?: () => void
  disabled?: boolean
  scaleValue?: number
  scaleBySize?: boolean
  animatedType?: AnimatedType
  haptic?: boolean
  style?: StyleProp<ViewStyle>
  surfaceProps?: Partial<MySurfaceProps>
}
