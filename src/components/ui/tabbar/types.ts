import type { ComponentProps } from 'react'
import { Ionicons } from '@expo/vector-icons'

export type TabBarIconName = ComponentProps<typeof Ionicons>['name']

export type TabBarNavItem = {
  id: string
  labelKey: string
  icon: TabBarIconName
  iconFocused?: TabBarIconName
}
