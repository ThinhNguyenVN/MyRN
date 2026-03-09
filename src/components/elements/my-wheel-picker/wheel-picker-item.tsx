import React, { memo } from 'react'
import { View } from 'react-native'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { WheelPickerRowProps } from './type'

const WheelPickerRow = memo(function WheelPickerRow({
  index,
  option,
  height,
  scrollY,
  itemHeight,
  visibleRest,
  scaleOutputRange,
  opacityOutputRange,
  itemStyle,
}: WheelPickerRowProps) {
  const styles = useThemedStyles(generateStyles)

  const animatedStyle = useAnimatedStyle(() => {
    'worklet'
    const scrollIndex = scrollY.value / itemHeight + visibleRest
    const distance = index - scrollIndex
    const absDistance = Math.abs(distance)
    return {
      opacity: interpolate(absDistance, [0, 1, 2, 3, 4], opacityOutputRange, 'clamp'),
      transform: [
        {
          scale: interpolate(absDistance, [0, 1, 2, 3, 4], scaleOutputRange, 'clamp'),
        },
      ],
    }
  }, [index, itemHeight, visibleRest, scaleOutputRange, opacityOutputRange])

  if (option === null) {
    return <View style={[{ height }, styles.item, itemStyle]} />
  }

  return (
    <Animated.View style={[styles.item, { height }, itemStyle, animatedStyle]}>
      <MyText typography="label" style={styles.itemText} numberOfLines={1}>
        {option.label}
      </MyText>
    </Animated.View>
  )
})

export default WheelPickerRow
