import React, { memo } from 'react'
import { Text, TextProps, TextStyle, StyleProp } from 'react-native'
import { Typography, TypographyKey } from '@/theme/typography'
import { TextColorType } from '@/theme/colors'
import { useTheme } from '@/theme/theme-context'

interface MyTextProps extends TextProps, Omit<TextStyle, 'color'> {
  typography?: TypographyKey
  color?: TextColorType
  style?: StyleProp<TextStyle>
}

const MyText: React.FC<MyTextProps> = ({
  typography = 'label',
  color = 'text/active/primary',
  style,
  children,
  ...rest
}: MyTextProps) => {
  const { getColor } = useTheme()
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
