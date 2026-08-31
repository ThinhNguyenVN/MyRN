import React, { memo } from 'react'

import MyPressable from '@/components/elements/my-pressable'
import MySurface from '@/components/elements/my-surface'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { isCardPressable } from './card-utils'
import { generateStyles } from './styles'
import type { MyCardProps } from './type'

const MyCard: React.FC<MyCardProps> = ({
  children,
  elevation: elevationProp,
  radius = 'medium',
  onPress,
  disabled = false,
  style,
  ...rest
}) => {
  const { defaultElevation, getColor } = useTheme()
  const styles = useThemedStyles(generateStyles)
  const elevation = elevationProp ?? defaultElevation
  const hasElevation = elevation !== 'none'
  const pressable = isCardPressable(onPress)
  const backgroundColor = getColor('fill/background/primary')

  const content = (
    <MyView {...rest} style={styles.content}>
      {children}
    </MyView>
  )

  const surface = hasElevation ? (
    <MySurface
      elevation={elevation}
      radius={radius}
      backgroundColor={backgroundColor}
      style={[styles.surface, style]}
    >
      {content}
    </MySurface>
  ) : (
    <MyView radius={radius} style={[styles.surface, { backgroundColor }, style]}>
      {content}
    </MyView>
  )

  return (
    <ConditionRenderer when={pressable} fallback={surface}>
      <MyPressable onPress={onPress} disabled={disabled} animatedType="scale">
        {surface}
      </MyPressable>
    </ConditionRenderer>
  )
}

MyCard.displayName = 'MyCard'

export default memo(MyCard)
