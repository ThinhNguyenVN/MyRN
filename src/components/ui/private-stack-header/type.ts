import type { ReactElement } from 'react'
import type { Href } from 'expo-router'

import type {
  NavigationBarHeaderExtraProps,
  NavigationBarHeaderProps,
} from '@/components/ui/navigation-bar/type'

export type PrivateStackHeaderProps = NavigationBarHeaderProps & NavigationBarHeaderExtraProps

export type UsePrivateStackHeadersParams = {
  /** Child screens (create/edit) fall back here when this stack cannot pop. */
  fallbackBackHref: Href
  /** Mobile list/index: back target when opened from Menu (omit for tab roots like History). */
  listFallbackBackHref?: Href
}

export type UsePrivateStackHeadersResult = {
  renderListHeader: (props: NavigationBarHeaderProps) => ReactElement
  renderChildHeader: (props: NavigationBarHeaderProps) => ReactElement
}
