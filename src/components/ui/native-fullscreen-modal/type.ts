import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export type NativeFullscreenPresentation = 'fullScreen' | 'pageSheet'

export type NativeFullscreenModalProps = {
  visible: boolean
  title: string
  children: ReactNode
  onClose: () => void
  /**
   * Default `pageSheet` — same chrome as `MyDropdownInput`.
   * iOS: `fullScreen` covers the window; `pageSheet` is the card sheet.
   * Android ignores this and always uses a full-window `Modal` plus status-bar padding.
   */
  presentation?: NativeFullscreenPresentation
  onDismiss?: () => void
  closeAccessibilityLabel?: string
  footer?: ReactNode
  avoidKeyboard?: boolean
  bodyStyle?: StyleProp<ViewStyle>
}
