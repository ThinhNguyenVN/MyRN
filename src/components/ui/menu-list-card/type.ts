import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'

export type MenuListItem = {
  key: string
  icon: ComponentProps<typeof Ionicons>['name']
  label: string
  onPress: () => void
}

export type MenuListCardProps = {
  items: MenuListItem[]
  /** Optional label rendered above the card (e.g. a group heading). */
  title?: string
  /** Trailing chevron on every row. Default `true`. */
  showChevron?: boolean
}
