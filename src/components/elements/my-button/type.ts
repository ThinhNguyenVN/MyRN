import type { ReactNode } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

import type { ElevationToken } from '@/theme/elevation'
import { MyPressableProps } from '../my-pressable'

export type ButtonSize = 'small' | 'large'

export type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'light' | 'dark'

export type ButtonWidth = number | 'auto' | 'full'

export type ButtonElevation = ElevationToken | 'none'

export interface MyButtonProps extends Omit<MyPressableProps, 'style' | 'children'> {
  text: string
  style?: StyleProp<ViewStyle>
  disabled?: boolean
  loading?: boolean
  size?: ButtonSize
  type?: ButtonType
  width?: ButtonWidth
  elevation?: ButtonElevation
  left?: ReactNode
  right?: ReactNode
  containerStyle?: StyleProp<ViewStyle>
}
