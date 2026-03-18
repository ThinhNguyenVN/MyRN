import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { type NativeSyntheticEvent, type NativeScrollEvent, Platform, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'

import { triggerHaptic } from '@/utils/haptic'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles, ITEM_HEIGHT, VISIBLE_COUNT } from './styles'
import type { WheelPickerViewProps, WheelPickerItem as WheelPickerItemType } from './type'
import WheelPickerRow from './wheel-picker-item'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<WheelPickerItemType | null>)

const IS_WEB = Platform.OS === 'web'
const VELOCITY_NEAR_ZERO = 1

const WheelPickerView = memo(function WheelPickerView({
  items,
  selectedIndex,
  onSelectIndex,
  itemHeight = ITEM_HEIGHT,
  visibleCount = VISIBLE_COUNT,
  haptic: hapticProp,
}: WheelPickerViewProps) {
  const { hapticEnabled } = useTheme()
  const haptic = hapticProp ?? hapticEnabled
  const styles = useThemedStyles(generateStyles)
  const flatListRef = useRef<FlatList<WheelPickerItemType | null>>(null)
  const scrollY = useSharedValue(0)
  const lastSelectedFromScrollRef = useRef<number | null>(null)
  const lastOffsetYRef = useRef(0)
  const lastTimeRef = useRef(0)
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastHapticIndexRef = useRef<number | null>(null)

  const visibleRest = Math.floor(visibleCount / 2)
  const containerHeight = (1 + visibleRest * 2) * itemHeight

  const paddedData = useMemo(() => {
    const pad = Array.from({ length: visibleRest }, () => null)
    return [...pad, ...items, ...pad]
  }, [visibleRest, items])

  const snapToOffsets = useMemo(
    () => paddedData.map((_, i) => i * itemHeight),
    [itemHeight, paddedData],
  )

  const scaleOutputRange = useMemo(
    () => Array.from({ length: visibleCount }, (_, i) => 1 / 1.15 ** i),
    [visibleCount],
  )
  const opacityOutputRange = useMemo(
    () => Array.from({ length: visibleCount }, (_, i) => 1 / 1.4 ** i),
    [visibleCount],
  )

  const clampIndex = useCallback(
    (i: number) => Math.max(0, Math.min(i, items.length - 1)),
    [items.length],
  )

  const getCenteredIndexForOffset = useCallback(
    (offsetY: number) => {
      const offset = Math.min(itemHeight * (paddedData.length - 1), Math.max(offsetY, 0))
      const centerY = offset + (containerHeight > 0 ? containerHeight / 2 : 0)
      const paddedIndex = Math.max(
        0,
        Math.min(paddedData.length - 1, Math.floor(centerY / itemHeight)),
      )
      const realIndex = paddedIndex - visibleRest
      const clamped = clampIndex(realIndex)
      return clamped
    },
    [itemHeight, paddedData.length, containerHeight, visibleRest, clampIndex],
  )

  const commitScrollEnd = useCallback(
    (offsetY: number) => {
      const clamped = getCenteredIndexForOffset(offsetY)
      if (clamped !== selectedIndex) {
        lastSelectedFromScrollRef.current = clamped
        onSelectIndex(clamped)
      }
    },
    [getCenteredIndexForOffset, selectedIndex, onSelectIndex],
  )
  const commitScrollEndRef = useRef(commitScrollEnd)
  commitScrollEndRef.current = commitScrollEnd

  /** Chỉ web: onMomentumScrollEnd không fire, dùng onScroll + velocity gần 0 để coi là scroll end. */
  const handleScrollOffsetForWeb = useCallback((offsetY: number) => {
    const now = Date.now()
    const prevOffset = lastOffsetYRef.current
    const prevTime = lastTimeRef.current
    lastOffsetYRef.current = offsetY
    lastTimeRef.current = now

    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current)
      scrollEndTimeoutRef.current = null
    }

    const dt = now - prevTime
    const velocity = dt > 0 ? Math.abs((offsetY - prevOffset) / dt) : 0
    if (prevTime > 0 && velocity <= VELOCITY_NEAR_ZERO) {
      commitScrollEndRef.current(offsetY)
      return
    }

    scrollEndTimeoutRef.current = setTimeout(() => {
      scrollEndTimeoutRef.current = null
      commitScrollEndRef.current(lastOffsetYRef.current)
    }, 150)
  }, [])

  const handleScrollHaptic = useCallback(
    (offsetY: number) => {
      if (!haptic) return
      const idx = getCenteredIndexForOffset(offsetY)
      if (idx === lastHapticIndexRef.current) return
      lastHapticIndexRef.current = idx
      triggerHaptic('Rigid')
    },
    [getCenteredIndexForOffset, haptic],
  )

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y
      if (IS_WEB) {
        runOnJS(handleScrollOffsetForWeb)(e.contentOffset.y)
      }
      runOnJS(handleScrollHaptic)(e.contentOffset.y)
    },
  })

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current)
        scrollEndTimeoutRef.current = null
      }
      commitScrollEnd(e.nativeEvent.contentOffset.y)
    },
    [commitScrollEnd],
  )
  const getCenteredOffsetForIndex = useCallback(
    (index: number) => {
      const clamped = clampIndex(index)
      const maxOffset = Math.max(0, (paddedData.length - 1) * itemHeight)
      const centered =
        (visibleRest + clamped) * itemHeight +
        itemHeight / 2 -
        (containerHeight > 0 ? containerHeight / 2 : 0)
      return Math.max(0, Math.min(maxOffset, centered))
    },
    [visibleRest, itemHeight, containerHeight, paddedData.length, clampIndex],
  )

  useEffect(() => {
    if (items.length === 0) return
    if (lastSelectedFromScrollRef.current === selectedIndex) {
      lastSelectedFromScrollRef.current = null
      return
    }
    flatListRef.current?.scrollToOffset({
      offset: getCenteredOffsetForIndex(selectedIndex),
      animated: false,
    })
  }, [selectedIndex, items.length, getCenteredOffsetForIndex])

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: itemHeight,
      offset: index * itemHeight,
      index,
    }),
    [itemHeight],
  )

  const renderItem = useCallback(
    ({ item, index }: { item: WheelPickerItemType | null; index: number }) => (
      <WheelPickerRow
        index={index}
        option={item}
        height={itemHeight}
        scrollY={scrollY}
        itemHeight={itemHeight}
        visibleRest={visibleRest}
        scaleOutputRange={scaleOutputRange}
        opacityOutputRange={opacityOutputRange}
      />
    ),
    [itemHeight, scrollY, visibleRest, scaleOutputRange, opacityOutputRange],
  )

  const keyExtractor = useCallback(
    (_: WheelPickerItemType | null, index: number) => String(index),
    [],
  )

  if (items.length === 0) {
    return <View style={[styles.wrap, { height: containerHeight }]} />
  }

  const initialScrollIndex = Math.min(
    paddedData.length - 1,
    Math.max(0, Math.round(getCenteredOffsetForIndex(selectedIndex) / itemHeight)),
  )

  return (
    <View style={[styles.wrap, { height: containerHeight }]}>
      <View
        style={[
          styles.highlight,
          {
            top: (containerHeight - itemHeight) / 2,
            height: itemHeight,
          },
        ]}
      />
      <AnimatedFlatList
        ref={flatListRef}
        data={paddedData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        pagingEnabled
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        snapToOffsets={snapToOffsets}
        decelerationRate={'fast' as const}
        initialScrollIndex={initialScrollIndex}
        nestedScrollEnabled
      />
    </View>
  )
})

export default WheelPickerView
