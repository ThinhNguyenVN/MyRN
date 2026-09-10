import { memo, useCallback, useEffect, type ReactNode } from 'react'
import { type LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { ANIMATION_MS, TRACK_PADDING, generateStyles } from './styles'
import type { MySegmentItemProps, MySegmentOption, MySegmentProps } from './type'

function SegmentItemInner<T extends string>({
  option,
  isActive,
  size,
  disabled,
  onSelect,
}: MySegmentItemProps<T>) {
  const styles = useThemedStyles(generateStyles)
  const handlePress = useCallback(() => {
    if (disabled || isActive) {
      return
    }
    onSelect(option.value)
  }, [disabled, isActive, onSelect, option.value])

  return (
    <MyPressable
      haptic={false}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.option, size === 'compact' ? styles.optionCompact : null]}
      accessibilityRole="radio"
      accessibilityState={{ selected: isActive, disabled }}
      accessibilityLabel={option.accessibilityLabel ?? option.label}
    >
      <MyText
        typography={size === 'compact' ? 'caption' : 'label'}
        style={[styles.optionLabel, isActive ? styles.optionLabelActive : null]}
      >
        {option.label}
      </MyText>
    </MyPressable>
  )
}

const SegmentItem = memo(SegmentItemInner) as <T extends string>(
  props: MySegmentItemProps<T>,
) => ReactNode

function MySegmentInner<T extends string>({
  options,
  value,
  onChange,
  size = 'default',
  disabled = false,
  accessibilityLabel,
}: MySegmentProps<T>) {
  const styles = useThemedStyles(generateStyles)
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const optionCount = options.length

  const trackInnerWidth = useSharedValue(0)
  const countSv = useSharedValue(optionCount)
  const indexSv = useSharedValue(activeIndex)

  useEffect(() => {
    countSv.value = optionCount
  }, [countSv, optionCount])

  useEffect(() => {
    indexSv.value = withTiming(activeIndex, { duration: ANIMATION_MS })
  }, [activeIndex, indexSv])

  const handleTrackLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const inner = Math.max(0, event.nativeEvent.layout.width - TRACK_PADDING * 2)
      const isFirstLayout = trackInnerWidth.value === 0
      trackInnerWidth.value = inner
      if (isFirstLayout) {
        indexSv.value = activeIndex
      }
    },
    [activeIndex, indexSv, trackInnerWidth],
  )

  const pillStyle = useAnimatedStyle(() => {
    const count = countSv.value
    const width = count > 0 ? trackInnerWidth.value / count : 0
    return {
      width,
      transform: [{ translateX: indexSv.value * width }],
    }
  })

  const renderOption = useCallback(
    (option: MySegmentOption<T>) => (
      <SegmentItem
        key={`segment-${option.value}`}
        option={option}
        isActive={option.value === value}
        size={size}
        disabled={disabled}
        onSelect={onChange}
      />
    ),
    [disabled, onChange, size, value],
  )

  return (
    <MyView
      style={[styles.track, disabled ? styles.trackDisabled : null]}
      onLayout={handleTrackLayout}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />
      {options.map(renderOption)}
    </MyView>
  )
}

const MySegment = memo(MySegmentInner) as <T extends string>(props: MySegmentProps<T>) => ReactNode

export default MySegment
