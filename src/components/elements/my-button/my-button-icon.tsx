import React, { memo, useMemo } from 'react'

import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import MyView from '@/components/elements/my-view'
import MyIcon from '../my-icon'
import MySpinner from '../my-spinner'
import MyPressable from '../my-pressable'

import { isButtonInteractionLocked, usesOnPrimaryButtonText } from './button-utils'
import { generateStyles } from './styles'
import type { MyButtonIconProps } from './type'

const TEXT_ON_PRIMARY = '#ffffff'
const ICON_SIZE_SMALL = 20
const ICON_SIZE_LARGE = 24

const MyButtonIcon: React.FC<MyButtonIconProps> = ({
  icon,
  style,
  disabled = false,
  loading = false,
  size = 'large',
  type = 'primary',
  elevation: elevationProp,
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

  const useWhiteIcon = usesOnPrimaryButtonText(type, disabled)
  const iconColor = useWhiteIcon ? TEXT_ON_PRIMARY : getColor('icon/active/primary')
  const iconSize = size === 'small' ? ICON_SIZE_SMALL : ICON_SIZE_LARGE

  const sizeStyle = size === 'small' ? styles.iconButtonSmall : styles.iconButtonLarge
  const buttonStyle = [styles?.[type], sizeStyle]
  const content = loading ? (
    <MySpinner color={useWhiteIcon ? 'light' : 'primary'} size="small" />
  ) : (
    <MyIcon name={icon} size={iconSize} color={iconColor} />
  )

  const surfaceStyle = [buttonStyle, disabled && styles.disabled, style]
  const touchableStyle = [...(hasContainerPropsStyle ? [containerPropsStyle] : []), containerStyle]

  return (
    <MyPressable
      disabled={isButtonInteractionLocked(disabled, loading)}
      {...pressableProps}
      style={touchableStyle}
    >
      <MyView elevation={elevation} style={surfaceStyle} radius="full" fillParent>
        {content}
      </MyView>
    </MyPressable>
  )
}

MyButtonIcon.displayName = 'MyButton.Icon'

export default memo(MyButtonIcon)
