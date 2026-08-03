import type { StyleProp, ViewStyle } from 'react-native'

import type { ContainerStyleProps } from '@/types/styles'

export type MyDividerOrientation = 'horizontal' | 'vertical'

export interface MyDividerProps extends ContainerStyleProps {
  /** @default 'horizontal' */
  orientation?: MyDividerOrientation
  style?: StyleProp<ViewStyle>
}
