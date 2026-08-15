import type { ReactElement, ReactNode } from 'react'
import type { Href } from 'expo-router'

import type {
  NavigationBarHeaderExtraProps,
  NavigationBarHeaderProps,
} from '@/components/ui/navigation-bar/type'

export type PrivateStackHeaderProps = NavigationBarHeaderProps & NavigationBarHeaderExtraProps

export type UsePrivateStackHeadersParams = {
  /** List/index route used when a child screen cannot pop within this stack. */
  fallbackBackHref: Href
}

export type UsePrivateStackHeadersResult = {
  renderListMenu: () => ReactNode
  renderListHeader: (props: NavigationBarHeaderProps) => ReactElement
  renderChildHeader: (props: NavigationBarHeaderProps) => ReactElement
}
