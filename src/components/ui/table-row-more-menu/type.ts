import type { ComponentProps } from 'react'
import type { Ionicons } from '@expo/vector-icons'

import type { ButtonType } from '@/components/elements/my-button'

export type TableRowMoreMenuItem = {
  key: string
  text: string
  icon: ComponentProps<typeof Ionicons>['name']
  type?: ButtonType
  disabled?: boolean
  onPress: () => void
}

export type TableRowMoreMenuProps = {
  items: TableRowMoreMenuItem[]
  accessibilityLabel: string
  panelMinWidth?: number
}
