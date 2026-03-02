import type { NativeStackHeaderProps } from '@react-navigation/native-stack'
import type { ReactNode } from 'react'

export interface NavigationBarProps {
  title?: string
  onBackPress?: () => void
  right?: ReactNode
  /** Show back button. When true and onBackPress provided, back is visible. */
  showBack?: boolean
}

/** Extends NativeStackHeaderProps for use as Stack header component */
export type NavigationBarHeaderProps = NativeStackHeaderProps
