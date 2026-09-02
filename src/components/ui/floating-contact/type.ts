import type { ComponentProps } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { Feather } from '@expo/vector-icons'

export interface FloatingContactItem {
  readonly key: string
  readonly icon: ComponentProps<typeof Feather>['name']
  readonly color: string
  readonly accessibilityLabel: string
  readonly onPress: () => void
  /** Bigger size + pulsing ring — use for the single primary action (e.g. call). */
  readonly emphasized?: boolean
}

export interface FloatingContactProps {
  readonly items: readonly FloatingContactItem[]
  readonly style?: StyleProp<ViewStyle>
}
