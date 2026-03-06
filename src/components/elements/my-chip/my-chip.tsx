import React, { memo, useMemo } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'

import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'

import { generateStyles } from './styles'
import type { ChipType, MyChipProps } from './type'

const TEXT_ON_PRIMARY = '#ffffff'
const DEFAULT_ELEVATION: MyChipProps['elevation'] = 'none'

function getStyleKey(type: ChipType, selected: boolean): string {
  if (selected) return `${type}Selected`
  return type
}

const MyChip: React.FC<MyChipProps> = ({
  label,
  type = 'filled',
  size = 'medium',
  selected = false,
  disabled = false,
  left,
  right,
  showClose = false,
  onClose,
  onPress,
  elevation = DEFAULT_ELEVATION,
  style,
  containerStyle,
  ...rest
}) => {
  const { getColor } = useTheme()
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

  const styleKey = getStyleKey(type, selected)
  const surfaceStyle: StyleProp<ViewStyle> = [
    styles[styleKey as keyof typeof styles] ?? styles.filled,
    size === 'small' ? styles.sizeSmall : styles.sizeMedium,
    disabled ? styles.disabled : undefined,
    style,
  ]

  const useWhiteText =
    (type === 'primary' && !selected) || (selected && (type === 'secondary' || type === 'filled'))
  const textColor = useWhiteText ? TEXT_ON_PRIMARY : getColor('text/active/primary')
  const textStyle = useMemo(() => ({ color: textColor }), [textColor])
  const typography = size === 'small' ? 'caption' : 'label'

  const rightContent = showClose ? (
    <Pressable style={styles.closeTouchable} onPress={onClose} disabled={disabled}>
      <MyIcon
        name="close"
        size={size === 'small' ? 14 : 18}
        color={useWhiteText ? ('#ffffff' as const) : 'icon/active/primary'}
      />
    </Pressable>
  ) : (
    (right ?? null)
  )

  const content = (
    <>
      {left ?? null}
      <MyText typography={typography} style={textStyle} numberOfLines={1}>
        {label}
      </MyText>
      {rightContent}
    </>
  )

  const touchableStyle = [...(hasContainerPropsStyle ? [containerPropsStyle] : []), containerStyle]

  if (!!onPress) {
    return (
      <MyPressable disabled={disabled} onPress={onPress} {...pressableProps} style={touchableStyle}>
        <MyView radius="full" elevation={elevation} style={surfaceStyle}>
          {content}
        </MyView>
      </MyPressable>
    )
  }

  return (
    <MyView radius="full" elevation={elevation} style={[surfaceStyle, touchableStyle]}>
      {content}
    </MyView>
  )
}

export default memo(MyChip)
