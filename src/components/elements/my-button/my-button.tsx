import React, { memo, useMemo } from 'react'
import { ViewStyle } from 'react-native'

import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { generateStyles } from './styles'

import {
  getButtonWidthStyle,
  isButtonInteractionLocked,
  shouldRenderButtonLabel,
  usesOnPrimaryButtonText,
} from './button-utils'
import type { MyButtonProps } from './type'
import MySpinner from '../my-spinner'
import MyPressable from '../my-pressable'

import MyButtonIcon from './my-button-icon'

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
  textColor: textColorProp,
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

  const widthStyle: ViewStyle | null = useMemo(() => getButtonWidthStyle(width), [width])

  const buttonStyle: ViewStyle[] = useMemo(
    () => [
      styles?.[type],
      size === 'small' ? styles.sizeSmall : styles.sizeLarge,
      ...(widthStyle ? [widthStyle] : []),
    ],
    [styles, type, size, widthStyle],
  )
  const useWhiteText = usesOnPrimaryButtonText(type, disabled)
  const textColor = disabled
    ? getColor('brand/white')
    : (textColorProp ??
      (useWhiteText
        ? getColor('brand/white')
        : type === 'secondary'
          ? getColor('brand/secondary')
          : getColor('text/active/primary')))
  const textStyle = useMemo(() => ({ color: textColor, flexShrink: 0 }), [textColor])

  const content = (
    <>
      {loading ? (
        <MySpinner color={useWhiteText ? 'light' : 'primary'} size="small" />
      ) : (
        <>
          {left ?? null}
          {shouldRenderButtonLabel(text, loading) ? (
            <MyText typography="button" style={textStyle}>
              {text}
            </MyText>
          ) : null}
          {right ?? null}
        </>
      )}
    </>
  )

  const surfaceStyle = useMemo(
    () => [buttonStyle, disabled && styles.disabled, style],
    [buttonStyle, disabled, styles.disabled, style],
  )
  const touchableStyle = useMemo(
    () => [
      width === 'full' ? styles.touchable : null,
      ...(widthStyle ? [widthStyle] : []),
      ...(hasContainerPropsStyle ? [containerPropsStyle] : []),
      containerStyle,
    ],
    [
      width,
      styles.touchable,
      widthStyle,
      hasContainerPropsStyle,
      containerPropsStyle,
      containerStyle,
    ],
  )

  return (
    <MyPressable
      disabled={isButtonInteractionLocked(disabled, loading)}
      {...pressableProps}
      style={touchableStyle}
    >
      <MyView radius="large" elevation={elevation} fillParent style={surfaceStyle}>
        {content}
      </MyView>
    </MyPressable>
  )
}

const MyButtonWithIcon = Object.assign(memo(MyButton), {
  Icon: MyButtonIcon,
})

export default MyButtonWithIcon
