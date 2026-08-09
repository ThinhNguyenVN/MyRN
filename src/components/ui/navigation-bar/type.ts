import type { ReactNode } from 'react'

export interface NavigationBarProps {
  title?: string
  onBackPress?: () => void
  /** Custom left slot (e.g. menu). When set, hides the default back button. */
  left?: ReactNode
  right?: ReactNode
  /** Show back button. When true and onBackPress provided, back is visible (unless `left` is set). */
  showBack?: boolean
}

/** Minimal stack-header navigation helpers used by NavigationBarHeader */
export type NavigationBarHeaderNavigation = {
  canGoBack: () => boolean
  goBack: () => void
}

/** Minimal stack header options used by NavigationBarHeader */
export type NavigationBarHeaderOptions = {
  title?: string
  headerRight?: (props: { canGoBack: boolean }) => ReactNode
}

/**
 * Local stand-in for former NativeStackHeaderProps.
 * Expo Router SDK 56+ no longer exposes @react-navigation/native-stack for app code.
 */
export type NavigationBarHeaderProps = {
  navigation?: NavigationBarHeaderNavigation
  options?: NavigationBarHeaderOptions
}
