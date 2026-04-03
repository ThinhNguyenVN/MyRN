import React, { memo, useMemo } from 'react'
import { ViewStyle } from 'react-native'

import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { generateStyles } from './styles'

import type { MyButtonProps } from './type'
import MySpinner from '../my-spinner'
import MyPressable from '../my-pressable'

import MyButtonIcon from './my-button-icon'

const TEXT_ON_PRIMARY = '#ffffff'

const MyButton: React.FC<MyButtonProps> = ({
  text,
  style,
  disabled = false,
  loading = false,
  size = 'large',
  type = 'primary',
  width = 'full',
  elevation: elevationProp,
  left,
  right,
  containerStyle,
  ...rest
}) => {
  const { getColor, defaultElevation } = useTheme()
  const elevation = elevationProp ?? defaultElevation
  const styles = useThemedStyles(generateStyles)

  const containerPropsStyle = useMemo(
    () =>
      getContainerStyle(
        pickContainerProps(rest as Record<string, unknown>) as Parameters<
          typeof getContainerStyle
        >[0],
      ),
    [rest],
  )
  const hasContainerPropsStyle = Object.keys(containerPropsStyle).length > 0
  const pressableProps = omitContainerProps(rest as Record<string, unknown>)

  const widthStyle: ViewStyle | null = useMemo(() => {
    switch (width) {
      case 'full':
        return { width: '100%', alignSelf: 'stretch', flexShrink: 1 }
      case 'auto':
        return { width: 'auto' }
      default:
        return { width }
    }
  }, [width])

  const buttonStyle: ViewStyle[] = [
    styles?.[type],
    size === 'small' ? styles.sizeSmall : styles.sizeLarge,
    ...(widthStyle ? [widthStyle] : []),
  ]
  const useWhiteText = type === 'primary' || type === 'dark' || type === 'tertiary' || disabled
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
  const touchableStyle = [
    styles.touchable,
    ...(width === 'full' && widthStyle ? [widthStyle] : []),
    ...(hasContainerPropsStyle ? [containerPropsStyle] : []),
    containerStyle,
  ]

  return (
    <MyPressable disabled={disabled || loading} {...pressableProps} style={touchableStyle}>
      <MyView radius="large" elevation={elevation} style={surfaceStyle}>
        {content}
      </MyView>
    </MyPressable>
  )
}

const MyButtonWithIcon = Object.assign(memo(MyButton), {
  Icon: MyButtonIcon,
})

export default MyButtonWithIcon
