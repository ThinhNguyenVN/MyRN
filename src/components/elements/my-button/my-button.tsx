import React, { memo, useMemo } from 'react'
import { ViewStyle } from 'react-native'

import { useTheme, useThemedStyles } from '@/theme/theme-context'

import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { generateStyles } from './styles'

import type { MyButtonProps } from './type'
import MySpinner from '../my-spinner'
import MyPressable from '../my-pressable'

const TEXT_ON_PRIMARY = '#ffffff'
const DEFAULT_ELEVATION: MyButtonProps['elevation'] = 'soft/down/small'

const MyButton: React.FC<MyButtonProps> = ({
  text,
  style,
  disabled = false,
  loading = false,
  size = 'large',
  type = 'primary',
  width = 'full',
  elevation = DEFAULT_ELEVATION,
  left,
  right,
  containerStyle,
  ...rest
}) => {
  const { getColor } = useTheme()
  const styles = useThemedStyles(generateStyles)

  const widthStyle: ViewStyle | null =
    width === 'full'
      ? { width: '100%', alignSelf: 'stretch' }
      : typeof width === 'number'
        ? { width }
        : null

  const buttonStyle: ViewStyle[] = [
    styles?.[type],
    size === 'small' ? styles.sizeSmall : styles.sizeLarge,
    ...(widthStyle ? [widthStyle] : []),
  ]
  const useWhiteText = type === 'primary' || type === 'dark' || disabled
  const textColor = useWhiteText ? TEXT_ON_PRIMARY : getColor('text/active/primary')
  const textStyle = useMemo(() => ({ color: textColor }), [textColor])

  const content = (
    <>
      {loading ? (
        <MySpinner color={useWhiteText ? 'light' : 'primary'} size="small" />
      ) : (
        <>
          {left ?? null}
          <MyText typography="button" style={textStyle}>
            {text}
          </MyText>
          {right ?? null}
        </>
      )}
    </>
  )

  const surfaceStyle = [buttonStyle, disabled && styles.disabled, style]
  const touchableStyle = [styles.touchable, ...(widthStyle ? [widthStyle] : []), containerStyle]

  return (
    <MyPressable disabled={disabled || loading} {...rest} style={touchableStyle}>
      {elevation === 'none' ? (
        <MyView radius="large" style={surfaceStyle}>
          {content}
        </MyView>
      ) : (
        <MySurface radius="large" elevation={elevation} style={surfaceStyle}>
          {content}
        </MySurface>
      )}
    </MyPressable>
  )
}

export default memo(MyButton)
