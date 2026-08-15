import type { ReactNode } from 'react'
import type { Href } from 'expo-router'

export interface NavigationBarProps {
  title?: string
  onBackPress?: () => void
  /** Optional left slot (e.g. hamburger). When set, replaces the default back button area. */
  left?: ReactNode
  right?: ReactNode
  /** Show back button. When true and onBackPress provided, back is visible. */
  showBack?: boolean
}

/** Minimal stack route entry used when typing navigation state. */
export type NavigationBarHeaderRoute = {
  key: string
  name: string
}

/** Minimal stack state used to detect in-stack back (not parent tab history). */
export type NavigationBarHeaderNavState = {
  index?: number
  routes?: NavigationBarHeaderRoute[]
}

/** Minimal stack-header navigation helpers used by NavigationBarHeader */
export type NavigationBarHeaderNavigation = {
  canGoBack: () => boolean
  goBack: () => void
  getState?: () => NavigationBarHeaderNavState
}

/** Minimal stack header options used by NavigationBarHeader */
export type NavigationBarHeaderOptions = {
  title?: string
  headerLeft?: (props: { canGoBack: boolean }) => ReactNode
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

export type NavigationBarHeaderExtraProps = {
  hideBackButton?: boolean
  /**
   * When the nested stack cannot pop (e.g. deep link / web tab jump left only `[id]`),
   * navigate here instead of `router.back()` which often returns to the previous tab.
   */
  fallbackBackHref?: Href
}
