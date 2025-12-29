import React from 'react'
import { Text, TextProps, TextStyle, StyleProp } from 'react-native'
import { Typography, TypographyKey } from '@/theme/typography'

interface MyTextProps extends TextProps {
  typography?: TypographyKey
  style?: StyleProp<TextStyle>
}

export function MyText({ typography = 'label', style, children, ...rest }: MyTextProps) {
  return (
    <Text {...rest} style={[Typography[typography] as TextStyle, style]}>
      {children}
    </Text>
  )
}
