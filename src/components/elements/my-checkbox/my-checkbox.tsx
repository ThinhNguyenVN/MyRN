import React, { memo, useCallback, useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import type { MyCheckboxProps } from './type'
import { generateStyles } from './styles'

const DEFAULT_ELEVATION = 'soft/down/small' as const
const SPRING_CONFIG = { damping: 30, stiffness: 200 }

const MyCheckbox = memo(function MyCheckbox({
  type = 'checkbox',
  checked = false,
  onValueChange,
  disabled = false,
  elevation = DEFAULT_ELEVATION,
  label,
  isLeftLabel = true,
  labelStyle,
  style,
}: MyCheckboxProps) {
  const styles = useThemedStyles(generateStyles)
  const scale = useSharedValue(checked ? 1 : 0)

  useEffect(() => {
    scale.value = checked ? withSpring(1, SPRING_CONFIG) : 0
  }, [checked, scale])

  const handlePress = useCallback(() => {
    if (disabled) return
    onValueChange?.(!checked)
  }, [disabled, checked, onValueChange])

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const boxStyle = [styles.box, checked && styles.boxChecked, disabled && styles.boxDisabled]

  const checkedContent =
    type === 'checkbox' ? (
      <MyIcon name="checkmark" size={16} color="icon/active/tertiary" style={styles.checkmark} />
    ) : (
      <View style={styles.radioDot} />
    )

  const boxContent = (
    <Animated.View style={[styles.checkedContentWrap, animatedContentStyle]}>
      {checkedContent}
    </Animated.View>
  )

  const box = (
    <MyView elevation={elevation} radius={type === 'checkbox' ? 'small' : 'full'} style={boxStyle}>
      {boxContent}
    </MyView>
  )

  const labelNode = <MyText style={labelStyle}>{label}</MyText>

  return (
    <MyPressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.row, style]}
      animatedType={'opacity'}
    >
      {isLeftLabel ? labelNode : null}
      {box}
      {!isLeftLabel ? labelNode : null}
    </MyPressable>
  )
})

MyCheckbox.displayName = 'MyCheckbox'

export default MyCheckbox
