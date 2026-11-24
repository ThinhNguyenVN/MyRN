import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { type LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { ANIMATION_MS, TRACK_PADDING, generateStyles } from './styles'
import type { MySegmentItemProps, MySegmentOption, MySegmentProps, SegmentSlot } from './type'

function SegmentItemInner<T extends string>({
  option,
  isActive,
  size,
  fill,
  disabled,
  onSelect,
  onMeasure,
}: MySegmentItemProps<T>) {
  const styles = useThemedStyles(generateStyles)
  const handlePress = useCallback(() => {
    if (disabled || isActive) {
      return
    }
    onSelect(option.value)
  }, [disabled, isActive, onSelect, option.value])

  // Measured on a wrapper: `MyPressable` does not forward `onLayout`.
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout
      onMeasure(option.value, { x, width })
    },
    [onMeasure, option.value],
  )

  return (
    <MyView style={[styles.slot, fill ? styles.optionFill : null]} onLayout={handleLayout}>
      <MyPressable
        haptic={false}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.option,
          size === 'compact' ? styles.optionCompact : null,
          fill ? styles.optionInnerFill : null,
        ]}
        accessibilityRole="radio"
        accessibilityState={{ selected: isActive, disabled }}
        accessibilityLabel={
          option.accessibilityLabel ??
          (option.badge ? `${option.label} ${option.badge}` : option.label)
        }
      >
        <MyText
          typography={size === 'compact' ? 'caption' : 'label'}
          numberOfLines={1}
          style={[styles.optionLabel, isActive ? styles.optionLabelActive : null]}
        >
          {option.label}
        </MyText>
        {option.badge ? (
          <MyView style={styles.badge}>
            <MyText typography="caption" style={styles.badgeLabel}>
              {option.badge}
            </MyText>
          </MyView>
        ) : null}
      </MyPressable>
    </MyView>
  )
}

const SegmentItem = memo(SegmentItemInner) as <T extends string>(
  props: MySegmentItemProps<T>,
) => ReactNode

/**
 * The pill slides to the measured position and width of the selected option, so options of
 * different widths (a badge, a longer label) line up. Before the first measure it splits the
 * track evenly.
 */
function MySegmentInner<T extends string>({
  options,
  value,
  onChange,
  size = 'default',
  fill = false,
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
  const slotX = useSharedValue(0)
  const slotWidth = useSharedValue(0)
  const slotsRef = useRef<Partial<Record<T, SegmentSlot>>>({})
  const [slotsVersion, setSlotsVersion] = useState(0)

  useEffect(() => {
    countSv.value = optionCount
  }, [countSv, optionCount])

  useEffect(() => {
    indexSv.value = withTiming(activeIndex, { duration: ANIMATION_MS })
  }, [activeIndex, indexSv])

  const handleMeasure = useCallback((optionValue: T, slot: SegmentSlot) => {
    const old = slotsRef.current[optionValue]
    if (old && old.x === slot.x && old.width === slot.width) {
      return
    }
    slotsRef.current[optionValue] = slot
    setSlotsVersion((version) => version + 1)
  }, [])

  useEffect(() => {
    const slot = slotsRef.current[value]
    if (!slot) {
      return
    }
    // The pill sits at `left: TRACK_PADDING`; slots are measured from the track's edge.
    const x = slot.x - TRACK_PADDING
    if (slotWidth.value === 0) {
      slotX.value = x
      slotWidth.value = slot.width
      return
    }
    slotX.value = withTiming(x, { duration: ANIMATION_MS })
    slotWidth.value = withTiming(slot.width, { duration: ANIMATION_MS })
  }, [slotWidth, slotX, slotsVersion, value])

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
    if (slotWidth.value > 0) {
      return { width: slotWidth.value, transform: [{ translateX: slotX.value }] }
    }
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
        fill={fill}
        disabled={disabled}
        onSelect={onChange}
        onMeasure={handleMeasure}
      />
    ),
    [disabled, fill, handleMeasure, onChange, size, value],
  )

  return (
    <MyView
      style={[styles.track, fill ? styles.trackFill : null, disabled ? styles.trackDisabled : null]}
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
