import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

import type { ElevationToken } from '@/theme/elevation'
import type { RadiusType } from '@/theme/radius'
import type { ContainerStyleProps } from '@/types/styles'

export interface MyCardProps extends ContainerStyleProps {
  children?: ReactNode
  /** @default theme.defaultElevation */
  elevation?: ElevationToken | 'none'
  /** @default 'medium' */
  radius?: RadiusType
  onPress?: () => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}
