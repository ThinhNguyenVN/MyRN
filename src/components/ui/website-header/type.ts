import type { Href } from 'expo-router'
import type { ReactNode } from 'react'

import type { ProfileMenuItem } from '@/components/ui/profile-menu-button'

/** Presentational desktop page header (private web chrome). */
export type WebsiteHeaderProps = {
  title: string
  /** When true, show a circular icon back button left of the title. */
  showBack?: boolean
  onBackPress?: () => void
  onNotificationsPress?: () => void
  /** Plain icon fallback when `profileMenuItems` is not passed. */
  onProfilePress?: () => void
  /** Avatar shown on the profile trigger when `profileMenuItems` is passed (falls back to a placeholder icon). */
  avatarUri?: string | null
  /**
   * When passed (non-empty), the profile action renders as a `ProfileMenuButton`
   * popover with these items instead of the plain `onProfilePress` icon button.
   */
  profileMenuItems?: ProfileMenuItem[]
  /** Optional slot before notifications (e.g. stack `headerRight`). */
  right?: ReactNode
}

/** Minimal stack state used to detect in-stack back (not parent tab history). */
export type WebsiteHeaderNavState = {
  index?: number
}

export type WebsiteHeaderNavigation = {
  canGoBack: () => boolean
  goBack: () => void
  getState?: () => WebsiteHeaderNavState
}

export type WebsiteHeaderOptions = {
  title?: string
  headerLeft?: (props: { canGoBack: boolean }) => ReactNode
  headerRight?: (props: { canGoBack: boolean }) => ReactNode
}

export type WebsiteHeaderNavProps = {
  navigation?: WebsiteHeaderNavigation
  options?: WebsiteHeaderOptions
}

export type WebsiteHeaderNavExtraProps = {
  hideBackButton?: boolean
  /**
   * When the nested stack cannot pop (e.g. deep link / web tab jump),
   * navigate here instead of `router.back()` which often returns to the previous tab.
   */
  fallbackBackHref?: Href
}

/** @deprecated Use WebsiteHeaderProps */
export type PrivatePageHeaderProps = WebsiteHeaderProps
/** @deprecated Use WebsiteHeaderNavProps */
export type PrivatePageHeaderNavProps = WebsiteHeaderNavProps
/** @deprecated Use WebsiteHeaderNavExtraProps */
export type PrivatePageHeaderNavExtraProps = WebsiteHeaderNavExtraProps
