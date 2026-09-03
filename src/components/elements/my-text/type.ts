import { TextProps, TextStyle, StyleProp } from 'react-native'

import { TypographyKey } from '@/theme/typography'
import { TextColorType } from '@/theme/colors'

export interface MyTextProps extends TextProps, Omit<TextStyle, 'color'> {
  typography?: TypographyKey
  color?: TextColorType
  style?: StyleProp<TextStyle>
}
