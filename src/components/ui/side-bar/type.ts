import type { RefObject } from 'react'
import type { StyleProp, View, ViewStyle } from 'react-native'
import type { ElevationToken } from '@/theme/elevation'

export interface SideBarItem {
  label: string
  href?: string
}

export interface SideBarProps {
  data: SideBarItem[]
  elevation?: ElevationToken | 'none'
  style?: StyleProp<ViewStyle>
}

export interface SideBarRowProps {
  item: SideBarItem
  index: number
  isActive: boolean
  onSelected: () => void
  containerRef?: RefObject<View | null>
  onMeasureLayout?: (index: number, y: number, height: number) => void
}
