import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export interface MyBottomSheetProps {
  title?: string
  showClose?: boolean
  onClosed?: () => void
  header?: ReactNode
  /** Rendered after sheet body (flow layout). Not a sticky/absolute footer. */
  footer?: ReactNode
  pressBackdropToClose?: boolean
  children: ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
  useScrollView?: boolean
  enablePanDownToClose?: boolean
  onDismiss?: () => void
  onChange?: (index: number) => void
  style?: StyleProp<ViewStyle>
  backgroundStyle?: StyleProp<ViewStyle>
  enableDynamicSizing?: boolean
  snapPoints?: (string | number)[]
  /** Controlled mode (web): state cha là nguồn sự thật duy nhất — không cần ref/effects. */
  visible?: boolean
  /** Gọi khi sheet đóng do tương tác (backdrop/X/hệ thống) trong controlled mode. */
  onClose?: () => void
  index?: number
}

export interface MyBottomSheetRef {
  open: () => void
  close: () => void
}
