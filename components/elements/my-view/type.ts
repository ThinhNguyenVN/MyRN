import { ViewProps, ViewStyle, StyleProp } from 'react-native'

import { FillColorType } from '@/theme/colors'
import { RadiusType } from '@/theme/radius'
import { SpacingType } from '@/theme/spacing'

export interface MyViewProps extends Omit<ViewProps, 'style'> {
  style?: StyleProp<ViewStyle>
  backgroundColor?: FillColorType
  padding?: SpacingType
  paddingLeft?: SpacingType
  paddingRight?: SpacingType
  paddingTop?: SpacingType
  paddingBottom?: SpacingType
  margin?: SpacingType
  marginLeft?: SpacingType
  marginRight?: SpacingType
  marginTop?: SpacingType
  marginBottom?: SpacingType
  radius?: RadiusType
}
