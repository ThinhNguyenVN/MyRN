import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'

import type { ElevationToken } from '@/theme/elevation'

import type { MyPressableProps } from '../my-pressable'

export type ChipType = 'primary' | 'secondary' | 'outlined' | 'filled'

export type ChipSize = 'small' | 'medium'

export type ChipElevation = ElevationToken | 'none'

export interface MyChipProps extends Omit<MyPressableProps, 'children'> {
  label: string
  type?: ChipType
  size?: ChipSize
  selected?: boolean
  disabled?: boolean
  left?: ReactNode
  right?: ReactNode
  showClose?: boolean
  onClose?: () => void
  onPress?: () => void
  elevation?: ChipElevation
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
}

/** Props for chip list; chipProps omits action props (label, onPress, onClose, showClose, selected). */
export type MyChipsChipProps = Omit<
  MyChipProps,
  'label' | 'onPress' | 'onClose' | 'showClose' | 'selected'
>

export interface MyChipsProps {
  data: string[]
  multiSelect?: boolean
  selected: string[]
  onChanged: (selected: string[]) => void
  canRemove?: boolean
  canAdd?: boolean
  disabled?: boolean
  onRemove?: (label: string) => void
  onAdd?: (label: string) => void
  chipProps?: MyChipsChipProps
  style?: StyleProp<ViewStyle>
}
