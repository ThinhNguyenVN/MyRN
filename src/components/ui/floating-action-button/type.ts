import type { ComponentProps } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { Ionicons } from '@expo/vector-icons'

import type { ButtonType } from '@/components/elements/my-button'

export type FloatingActionButtonProps = {
  icon?: ComponentProps<typeof Ionicons>['name']
  onPress: () => void
  accessibilityLabel: string
  type?: ButtonType
  /** Extra offset above the default bottom-right dock (e.g. tab bar). */
  bottomOffset?: number
  rightOffset?: number
  style?: StyleProp<ViewStyle>
  testID?: string
}
