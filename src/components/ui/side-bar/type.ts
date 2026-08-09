import type { ComponentProps, ReactNode, RefObject } from 'react'
import type { StyleProp, View, ViewStyle } from 'react-native'
import type { Ionicons } from '@expo/vector-icons'
import type { ElevationToken } from '@/theme/elevation'

export type SideBarIconName = ComponentProps<typeof Ionicons>['name']

export interface SideBarItem {
  label: string
  href?: string
  /** Leading icon (optional — playground keeps chevron-only rows). */
  icon?: SideBarIconName
  iconFocused?: SideBarIconName
  /**
   * Trailing chevron. Default: show when `href` is set and no leading `icon`
   * (playground). Product icon rows typically omit the chevron.
   */
  showChevron?: boolean
}

export type SideBarVariant = 'card' | 'flush'

export interface SideBarProps {
  data: SideBarItem[]
  elevation?: ElevationToken | 'none'
  style?: StyleProp<ViewStyle>
  onSelected?: (item: SideBarItem, index: number) => void
  /** Brand / title above the nav list. */
  header?: ReactNode
  /** Secondary actions below the nav list (e.g. Help / Logout). */
  footer?: ReactNode
  /**
   * `card` — elevated panel (playground default).
   * `flush` — full-height rail for product shell.
   */
  variant?: SideBarVariant
  /** Override sliding highlight fill (e.g. product Stitch CTA blue). */
  highlightColor?: string
}

export interface SideBarRowProps {
  item: SideBarItem
  index: number
  isActive: boolean
  onSelected: () => void
  containerRef?: RefObject<View | null>
  onMeasureLayout?: (index: number, y: number, height: number) => void
}
