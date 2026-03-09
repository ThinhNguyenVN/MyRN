import type { SharedValue } from 'react-native-reanimated'
import type { StyleProp, ViewStyle } from 'react-native'

export interface WheelPickerItem {
  label: string
  value: number
}

export interface WheelPickerViewProps {
  items: WheelPickerItem[]
  selectedIndex: number
  onSelectIndex: (index: number) => void
  itemHeight?: number
  visibleCount?: number
  /** Bật haptic khi scroll và dừng tại item mới. Mặc định true. */
  haptic?: boolean
}

export interface MyWheelPickerProps {
  items: WheelPickerItem[]
  value: number | null
  onValueChange: (value: number) => void
  title?: string
  placeholder?: string
  disabled?: boolean
  /** Bật haptic khi scroll wheel. Mặc định true. */
  haptic?: boolean
}

export interface WheelPickerRowProps {
  index: number
  option: WheelPickerItem | null
  height: number
  scrollY: SharedValue<number>
  itemHeight: number
  visibleRest: number
  scaleOutputRange: number[]
  opacityOutputRange: number[]
  itemStyle?: StyleProp<ViewStyle>
}
