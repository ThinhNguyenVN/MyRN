import React, { memo, useMemo } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'

import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { getContainerStyle, omitContainerProps, pickContainerProps } from '@/utils/styles'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'

import { generateStyles } from './styles'
import type { ChipSize, ChipTone, ChipType, MyChipProps } from './type'

function chipSizeStyle(
  size: ChipSize,
  styles: ReturnType<typeof generateStyles>,
): (typeof styles)['sizeMedium'] {
  if (size === 'xs') {
    return styles.sizeXs
  }
  if (size === 'tag') {
    return styles.sizeTag
  }
  if (size === 'small') {
    return styles.sizeSmall
  }
  return styles.sizeMedium
}

const TONE_TEXT: Record<
  ChipTone,
  'text/active/secondary' | `text/${Exclude<ChipTone, 'neutral'>}/primary`
> = {
  neutral: 'text/active/secondary',
  success: 'text/success/primary',
  alert: 'text/alert/primary',
  warning: 'text/warning/primary',
  info: 'text/info/primary',
}

const TONE_STYLE: Record<
  ChipTone,
  'toneNeutral' | 'toneSuccess' | 'toneAlert' | 'toneWarning' | 'toneInfo'
> = {
  neutral: 'toneNeutral',
  success: 'toneSuccess',
  alert: 'toneAlert',
  warning: 'toneWarning',
  info: 'toneInfo',
}

const TEXT_ON_PRIMARY = '#ffffff'

function getStyleKey(type: ChipType, selected: boolean): string {
  if (selected) return `${type}Selected`
  return type
}

const MyChip: React.FC<MyChipProps> = ({
  label,
  type = 'filled',
  tone,
  size = 'medium',
  selected = false,
  disabled = false,
  left,
  right,
  showClose = false,
  onClose,
  onPress,
  elevation: elevationProp,
  style,
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

  const styleKey = getStyleKey(type, selected)
  const surfaceStyle: StyleProp<ViewStyle> = [
    tone ? styles[TONE_STYLE[tone]] : (styles[styleKey as keyof typeof styles] ?? styles.filled),
    chipSizeStyle(size, styles),
    disabled ? styles.disabled : undefined,
    style,
  ]

  const useWhiteText =
    !tone &&
    ((type === 'primary' && !selected) || (selected && (type === 'secondary' || type === 'filled')))
  const textColor = useWhiteText
    ? TEXT_ON_PRIMARY
    : tone
      ? getColor(TONE_TEXT[tone])
      : getColor('text/active/primary')
  const textStyle = useMemo(() => ({ color: textColor }), [textColor])
  const typography = size === 'medium' ? 'label' : 'caption'

  const rightContent = showClose ? (
    <Pressable style={styles.closeTouchable} onPress={onClose} disabled={disabled}>
      <MyIcon
        name="close"
        size={size === 'medium' ? 18 : 14}
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
