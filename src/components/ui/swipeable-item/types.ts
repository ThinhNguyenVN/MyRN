import type { ComponentProps, ReactNode } from 'react'
import type { Ionicons } from '@expo/vector-icons'

import type { ButtonType } from '@/components/elements/my-button'

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
}

export type SwipeableItemCloseFn = () => void

export interface SwipeableItemRef {
  close: () => void
}

export interface SwipeableItemContextValue {
  /** Gọi khi user bắt đầu pan trên một row: đóng row đang mở khác (nếu có). */
  onRowPanBegin: (rowKey: string, closeThisRow: SwipeableItemCloseFn) => void
}

export interface SwipeableItemProviderProps {
  children: ReactNode
}
