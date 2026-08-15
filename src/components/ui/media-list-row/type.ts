import type { ComponentProps, ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { Ionicons } from '@expo/vector-icons'

export type MediaListRowProps = {
  title: string
  subtitle?: string
  imageUrl?: string | null
  placeholderIcon?: ComponentProps<typeof Ionicons>['name']
  trailing?: ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  testID?: string
}
