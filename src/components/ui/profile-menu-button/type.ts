import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'

export type ProfileMenuItem = {
  key: string
  text: string
  icon: ComponentProps<typeof Ionicons>['name']
  onPress: () => void
}

export type ProfileMenuButtonProps = {
  avatarUri?: string | null
  /** When set, the menu opens with the avatar + this name above the items. */
  displayName?: string | null
  items: ProfileMenuItem[]
  accessibilityLabel: string
}
