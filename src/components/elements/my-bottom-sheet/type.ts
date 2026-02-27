import type { ReactNode } from 'react'

import type { BottomSheetModalProps } from '@gorhom/bottom-sheet'

export interface MyBottomSheetProps extends Omit<BottomSheetModalProps, 'children'> {
  title?: string
  onClosed?: () => void
  header?: ReactNode
  footer?: ReactNode
  pressBackdropToClose?: boolean
  children: ReactNode
}

export interface MyBottomSheetRef {
  open: () => void
  close: () => void
}
