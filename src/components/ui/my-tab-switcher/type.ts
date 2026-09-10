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
  /**
   * Stretch to fill the parent (reports-style full-height pane).
   * Turn off when nested in a page ScrollView so iOS does not trap the pan.
   */
  fillParent?: boolean
  containerStyle?: StyleProp<ViewStyle>
  tabBarStyle?: StyleProp<ViewStyle>
}
