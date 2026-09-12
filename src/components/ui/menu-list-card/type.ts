import type { ComponentProps, ReactNode } from 'react'
import type { Ionicons } from '@expo/vector-icons'

export type MenuListItem = {
  key: string
  icon: ComponentProps<typeof Ionicons>['name']
  label: string
  onPress?: () => void
  /** Replaces the trailing chevron (e.g. a segmented switch). */
  trailing?: ReactNode
}

export type MenuListCardProps = {
  items: MenuListItem[]
  /** Optional label rendered above the card (e.g. a group heading). */
  title?: string
  /** Trailing chevron on rows that have `onPress` and no `trailing`. Default `true`. */
  showChevron?: boolean
}
