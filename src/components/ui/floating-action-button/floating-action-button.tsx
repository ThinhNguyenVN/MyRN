import React, { memo, useMemo } from 'react'

import MyButton from '@/components/elements/my-button'
import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { FloatingActionButtonProps } from './type'

function FloatingActionButtonComponent({
  icon = 'add',
  onPress,
  accessibilityLabel,
  type = 'primary',
  bottomOffset,
  rightOffset = 0,
  style,
  testID,
}: FloatingActionButtonProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing, insets } = useTheme()
  const resolvedBottom = (bottomOffset ?? insets.bottom ?? 0) + getSpacing('x2')

  const rootStyle = useMemo(
    () => [
      styles.root,
      {
        bottom: resolvedBottom,
        right: getSpacing('x4') + rightOffset,
      },
      style,
    ],
    [getSpacing, resolvedBottom, rightOffset, style, styles.root],
  )

  return (
    <MyView style={rootStyle} pointerEvents="box-none" fillParent={false} testID={testID}>
      <MyButton.Icon
        icon={icon}
        type={type}
        size="small"
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        containerStyle={styles.button}
        style={styles.button}
      />
    </MyView>
  )
}

export default memo(FloatingActionButtonComponent)
