import type { ReactNode } from 'react'

import type { BottomSheetModalProps } from '@gorhom/bottom-sheet'
import { StyleProp, ViewStyle } from 'react-native'

export interface MyBottomSheetProps extends Omit<BottomSheetModalProps, 'children'> {
  title?: string
  showClose?: boolean
  onClosed?: () => void
  header?: ReactNode
  footer?: ReactNode
  pressBackdropToClose?: boolean
  children: ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
}

export interface MyBottomSheetRef {
  open: () => void
  close: () => void
}
