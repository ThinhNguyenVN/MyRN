import { ViewProps, ViewStyle, StyleProp } from 'react-native'

import { FillColorType } from '@/theme/colors'
import type { ElevationToken } from '@/theme/elevation'
import { RadiusType } from '@/theme/radius'
import { ContainerStyleProps } from '@/types/styles'

export interface MyViewProps extends Omit<ViewProps, 'style'>, ContainerStyleProps {
  style?: StyleProp<ViewStyle>
  backgroundColor?: FillColorType
  radius?: RadiusType
  elevation?: ElevationToken | 'none'
  /** Only applies with `elevation` set (delegates to `MySurface`). Default false: content
   *  sizes to children — set true for pressable/stretch surfaces like buttons. */
  fillParent?: boolean
}
