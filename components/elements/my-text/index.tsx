import React, { memo } from 'react'
import { Text, TextProps, TextStyle, StyleProp } from 'react-native'
import { Typography, TypographyKey } from '@/theme/typography'
import { getColor, TextColorType } from '@/theme/colors'

interface MyTextProps extends TextProps {
  typography?: TypographyKey
  color?: TextColorType
  style?: StyleProp<TextStyle>
}

export function MyText({
  typography = 'label',
  color = 'text/active/primary',
  style,
  children,
  ...rest
}: MyTextProps) {
  return (
    <Text
      {...rest}
      style={[
        Typography[typography] as TextStyle,
        {
          color: getColor(color),
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}

export default memo(MyText)
