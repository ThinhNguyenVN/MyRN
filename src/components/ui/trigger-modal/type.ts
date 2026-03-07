import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

export interface TriggerLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface TriggerModalProps {
  visible: boolean
  onClose: () => void
  triggerLayout: TriggerLayout | null
  children: ReactNode
  footer?: ReactNode
  panelMinWidth?: number
  estimatedPanelHeight?: number
  safeInset?: number
  panelStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  footerContainerStyle?: StyleProp<ViewStyle>
}
