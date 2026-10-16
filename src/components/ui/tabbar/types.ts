import type { ComponentProps } from 'react'
import type { ImageSource } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

export type TabBarIconName = ComponentProps<typeof Ionicons>['name']

export type TabBarNavItem = {
  id: string
  labelKey: string
  icon: TabBarIconName
  iconFocused?: TabBarIconName
}

/** Raised action in the middle of the tab bar (see `useTabBar`'s `centerAction`). */
export type TabBarCenterAction = {
  /** Route name of the placeholder screen under the Tabs layout. */
  id: string
  labelKey: string
  /** Defaults to `labelKey`. */
  accessibilityLabelKey?: string
  icon?: TabBarIconName
  /** Local mark (e.g. brand M) drawn instead of `icon`, tinted white and centered. */
  mark?: ImageSource | number
  onPress: () => void
  /** Small corner pill text (e.g. "New"); omit to hide. */
  badge?: string
  /** End color of the button gradient; defaults to the solid CTA fill. */
  accentColor?: string
}
