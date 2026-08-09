import type { ReactNode } from 'react'
import type { GestureResponderEvent, PressableProps, StyleProp, ViewStyle } from 'react-native'

import type { ContainerStyleProps } from '@/types/styles'
import type { MyViewProps } from '../my-view'

export type AnimatedType = 'opacity' | 'scale'

/** RN web passes MouseEvent when Pressable renders as an anchor (`href`). */
export type MyPressableEvent =
  | GestureResponderEvent
  | (GestureResponderEvent & {
      button?: number
      metaKey?: boolean
      altKey?: boolean
      ctrlKey?: boolean
      shiftKey?: boolean
      preventDefault?: () => void
      currentTarget?: { target?: string }
    })

export interface MyPressableProps
  extends
    ContainerStyleProps,
    Omit<
      PressableProps,
      'children' | 'style' | 'onPress' | 'onPressIn' | 'onPressOut' | 'disabled'
    > {
  children: ReactNode
  onPress?: (event?: MyPressableEvent) => void
  onPressIn?: () => void
  onPressOut?: () => void
  disabled?: boolean
  scaleValue?: number
  scaleBySize?: boolean
  animatedType?: AnimatedType
  haptic?: boolean
  style?: StyleProp<ViewStyle>
  surfaceProps?: Partial<MyViewProps>
  /** When set (e.g. tab bar), RN web renders an `<a>`; must preventDefault for SPA nav. */
  href?: string
}
