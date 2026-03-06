import React, { memo, useCallback, useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { THUMB_TRAVEL, generateStyles } from './styles'
import type { MySwitchProps } from './type'

const MySwitch: React.FC<MySwitchProps> = ({
  value = false,
  onValueChange,
  disabled = false,
  label,
  isLeftLabel = true,
  labelStyle,
  style,
}) => {
  const styles = useThemedStyles(generateStyles)
  const thumbOffset = useSharedValue(value ? 1 : 0)

  useEffect(() => {
    thumbOffset.value = withTiming(value ? 1 : 0, { duration: 200 })
  }, [value, thumbOffset])

  const handlePress = useCallback(() => {
    if (disabled) return
    onValueChange?.(!value)
  }, [disabled, value, onValueChange])

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbOffset.value * THUMB_TRAVEL }],
  }))

  const trackStyle = [styles.track, value && styles.trackOn, disabled && styles.trackDisabled]

  const labelNode = !!label ? <MyText style={labelStyle}>{label}</MyText> : null

  return (
    <MyPressable
      onPress={handlePress}
      disabled={disabled}
      style={[styles.row, style]}
      animatedType="opacity"
    >
      {isLeftLabel ? labelNode : null}
      <MyView style={trackStyle}>
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
      </MyView>
      {!isLeftLabel ? labelNode : null}
    </MyPressable>
  )
}

MySwitch.displayName = 'MySwitch'

export default memo(MySwitch)
