import type { ViewProps, StyleProp, ViewStyle } from 'react-native'

import type { ContainerStyleProps } from '@/types/styles'

export type SpinnerColor = 'light' | 'dark' | 'primary' | 'alert' | 'warning'

export type SpinnerSize = 'default' | 'small' | 'xsmall'

export interface SpinnerColors {
  track: string
  stroke: string
}

export interface SpinnerDimensions {
  size: number
  strokeWidth: number
}

export interface MySpinnerProps extends Omit<ViewProps, 'style'>, ContainerStyleProps {
  /** @default 'dark' */
  color?: SpinnerColor
  /** @default 'default' */
  size?: SpinnerSize
  style?: StyleProp<ViewStyle>
}
