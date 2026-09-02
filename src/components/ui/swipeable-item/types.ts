import type { ComponentProps, ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import type { Ionicons } from '@expo/vector-icons'
import type { SharedValue } from 'react-native-reanimated'

import type { ButtonType } from '@/components/elements/my-button'
import type { ElevationToken } from '@/theme/elevation'

export type SwipeableItemIconName = ComponentProps<typeof Ionicons>['name']

export interface SwipeableItemAction {
  icon: SwipeableItemIconName
  type?: ButtonType
  onPress: () => void
  accessibilityLabel?: string
  disabled?: boolean
}

export interface SwipeableActionButtonsProps {
  actions: SwipeableItemAction[]
  rowKey: string
  wrapAction?: (fn: () => void) => void
}

/** Mặc định không set → **không** swipe-to-remove. */
export type SwipeToRemoveOption = 'left' | 'right' | 'both'

export type SwipeStripSide = 'left' | 'right'

export interface StaggeredIconScaleProps {
  translateX: SharedValue<number>
  side: SwipeStripSide
  staggerIndex: number
  children: ReactNode
}

export interface SwipeableItemProps {
  /** Bắt buộc trong list: đổi key → reset offset; tránh recycle FlatList làm hàng “dính”. */
  rowKey: string
  children: ReactNode
  leftActions?: SwipeableItemAction[]
  rightActions?: SwipeableItemAction[]
  onDelete: () => void
  /**
   * Không truyền: không cho commit xóa bằng vuốt (menu vẫn mở). `'left'` / `'right'` / `'both'`:
   * chỉ hướng đó (hoặc cả hai) mới vuốt xóa được.
   */
  swipeToRemove?: SwipeToRemoveOption
  testID?: string
  /**
   * Renders the row's shadow on a card-shell layer that slides together with `children` instead
   * of leaving it to `children` themselves — a shadow set on something inside the row gets cut
   * by the clip container that hides the reveal strips until swiped open (RN `overflow: hidden`
   * clips descendant shadows regardless of how much they'd otherwise bleed). Omit for a flat
   * row with no shadow.
   */
  elevation?: ElevationToken | 'none'
  /**
   * Extra style (e.g. `borderWidth`/`borderColor`) for the card-shell layer described above —
   * use this instead of a border on `children` so it slides with the row instead of staying
   * fixed while the row opens underneath it.
   */
  cardStyle?: StyleProp<ViewStyle>
}

export interface SwipeableItemRef {
  close: () => void
}

export type SwipeableItemCloseFn = () => void

export interface SwipeableItemContextValue {
  /** Gọi khi user bắt đầu pan trên một row: đóng row đang mở khác (nếu có). */
  onRowPanBegin: (rowKey: string, closeThisRow: SwipeableItemCloseFn) => void
}

export interface SwipeableItemProviderProps {
  children: ReactNode
}
