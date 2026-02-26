import React, { memo } from 'react'
import { TouchableOpacity, ViewStyle } from 'react-native'

import { useTheme } from '@/theme/theme-context'
import { useThemedStyles } from '@/hooks/use-themed-styles'

import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { generateStyles } from './styles'

import type { MyButtonProps } from './type'
import MySpinner from '../my-spinner'

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
  const styles = useThemedStyles((theme) => generateStyles(theme))

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

  const content = (
    <>
      {loading ? (
        <MySpinner color={useWhiteText ? 'light' : 'primary'} size="small" />
      ) : (
        <>
          {left ?? null}
          <MyText typography="button" style={{ color: textColor }}>
            {text}
          </MyText>
          {right ?? null}
        </>
      )}
    </>
  )

  const surfaceStyle = [buttonStyle, disabled && styles.disabled, style]

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
      style={[{ flex: 1, ...widthStyle }, containerStyle]}
    >
      {elevation === 'none' ? (
        <MyView radius="large" style={surfaceStyle}>
          {content}
        </MyView>
      ) : (
        <MySurface radius="large" elevation={elevation} style={surfaceStyle}>
          {content}
        </MySurface>
      )}
    </TouchableOpacity>
  )
}

export default memo(MyButton)
