import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import type { ElevationToken } from '@/theme/elevation'
import type { IconName } from '@/types/icon'

export type SideBarIconName = IconName

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
  /** Non-interactive section header row. */
  kind?: 'link' | 'section'
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
  /** Icon-only rail (product web compact). */
  collapsed?: boolean
  /** 0 = expanded, 1 = collapsed — drives width/label animation without layout jumps. */
  collapseProgress?: SharedValue<number>
}

export interface SideBarRowProps {
  item: SideBarItem
  index: number
  isActive: boolean
  onSelected: () => void
  onMeasureLayout?: (index: number, y: number, height: number) => void
  collapseProgress: SharedValue<number>
}
