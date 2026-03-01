import type { Ionicons } from '@expo/vector-icons'
import type { StyleProp, ViewStyle } from 'react-native'

import type { MyImageSource } from '@/components/elements/my-image'
import type { ElevationToken } from '@/theme/elevation'
import type { ButtonType } from '@/components/elements/my-button'
import type { ContainerStyleProps } from '@/types/styles'

export type MyAlertType = 'info' | 'success' | 'warning' | 'error'

export interface MyAlertButtonProp {
  text: string
  type?: ButtonType
  onPress: () => void
}

export interface MyAlertProps extends ContainerStyleProps {
  title?: string
  message?: string
  description?: string
  icon?: React.ComponentProps<typeof Ionicons>['name']
  image?: MyImageSource
  type?: MyAlertType
  elevation?: ElevationToken | 'none'
  onClose?: () => void
  buttons?: MyAlertButtonProp[]
  style?: StyleProp<ViewStyle>
}
