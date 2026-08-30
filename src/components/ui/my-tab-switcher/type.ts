import type { ReactNode } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

export type MyTabItem<TId extends string = string> = {
  id: TId
  label: string
}

export type MyTabSwitcherProps<TId extends string = string> = {
  /** Danh sách tab — thứ tự mảng quyết định hướng slide. */
  tabs: MyTabItem<TId>[]
  activeId: TId
  onChange: (id: TId) => void
  /** Nội dung tương ứng tab đang bật — được bọc animation slide theo hướng chuyển. */
  renderContent: (id: TId) => ReactNode
  /** Thời lượng slide (ms). Mặc định 220. */
  duration?: number
  containerStyle?: StyleProp<ViewStyle>
  tabBarStyle?: StyleProp<ViewStyle>
}
