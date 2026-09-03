import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { IconName } from '@/types/icon'

export type DrawerMenuIconName = IconName

/** Which edge the panel anchors to and slides from. Default `left`. */
export type DrawerMenuSide = 'left' | 'right'

export interface DrawerMenuItem {
  id: string
  label: string
  icon?: DrawerMenuIconName
}

export interface DrawerMenuProps {
  visible: boolean
  onClose: () => void
  /** Panel title (e.g. "Menu"). */
  title: string
  /** Primary line under the title (e.g. display name). */
  subtitle?: string
  /** Secondary line under subtitle (e.g. email · role). */
  meta?: string
  data: DrawerMenuItem[]
  onSelected?: (item: DrawerMenuItem, index: number) => void
  /** Replaces subtitle/meta block when set. */
  headerContent?: ReactNode
  footer?: ReactNode
  closeAccessibilityLabel?: string
  backdropAccessibilityLabel?: string
  /** Panel width in px. Default 300. */
  width?: number
  /** Slide-in edge. Default `left`. */
  side?: DrawerMenuSide
  style?: StyleProp<ViewStyle>
}
