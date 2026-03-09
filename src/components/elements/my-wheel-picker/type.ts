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
}

export interface MyWheelPickerProps {
  items: WheelPickerItem[]
  value: number | null
  onValueChange: (value: number) => void
  title?: string
  placeholder?: string
  disabled?: boolean
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
