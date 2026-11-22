import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'

export type ProfileMenuItem = {
  key: string
  text: string
  icon: ComponentProps<typeof Ionicons>['name']
  onPress: () => void
}

export type ProfileMenuButtonProps = {
  /** Photo on the trigger and in the menu header; wins over `initials`. */
  avatarUri?: string | null
  /** Letter(s) on the avatar when there is no photo (else a generic person icon). */
  initials?: string
  /** When set (or `subtitle`), the menu opens with the avatar + name above the items. */
  displayName?: string | null
  /** Secondary line under the name in the menu header (e.g. email). */
  subtitle?: string | null
  items: ProfileMenuItem[]
  accessibilityLabel: string
}
