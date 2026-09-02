import React, { memo } from 'react'
import { Text, TextStyle } from 'react-native'

import { Typography } from '@/theme/typography'
import { useTheme } from '@/theme/theme-context'

import type { MyTextProps } from './type'

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
