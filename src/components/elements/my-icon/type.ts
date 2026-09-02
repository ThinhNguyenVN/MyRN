import type { ComponentProps } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { Ionicons } from '@expo/vector-icons'

import type { IconColorType } from '@/theme/colors'
import type { ContainerStyleProps } from '@/types/styles'

export interface MyIconProps extends ContainerStyleProps {
  name: ComponentProps<typeof Ionicons>['name']
  size?: number
  color?: IconColorType | string
  style?: StyleProp<ViewStyle>
}
