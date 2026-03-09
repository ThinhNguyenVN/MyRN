import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { type NativeSyntheticEvent, type NativeScrollEvent, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'

import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles, ITEM_HEIGHT, VISIBLE_COUNT } from './styles'
import type { WheelPickerViewProps, WheelPickerItem as WheelPickerItemType } from './type'
import WheelPickerRow from './wheel-picker-item'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<WheelPickerItemType | null>)

const WheelPickerView = memo(function WheelPickerView({
  items,
  selectedIndex,
  onSelectIndex,
  itemHeight = ITEM_HEIGHT,
  visibleCount = VISIBLE_COUNT,
}: WheelPickerViewProps) {
  const styles = useThemedStyles(generateStyles)
  const flatListRef = useRef<FlatList<WheelPickerItemType | null>>(null)
  const scrollY = useSharedValue(0)
  const lastSelectedFromScrollRef = useRef<number | null>(null)

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

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y
    },
  })

  const clampIndex = useCallback(
    (i: number) => Math.max(0, Math.min(i, items.length - 1)),
    [items.length],
  )

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = Math.min(
        itemHeight * (paddedData.length - 1),
        Math.max(e.nativeEvent.contentOffset.y, 0),
      )

      const centerY = offsetY + (containerHeight > 0 ? containerHeight / 2 : 0)
      const paddedIndex = Math.max(
        0,
        Math.min(paddedData.length - 1, Math.floor(centerY / itemHeight)),
      )
      const realIndex = paddedIndex - visibleRest
      const clamped = clampIndex(realIndex)
      if (clamped !== selectedIndex) {
        lastSelectedFromScrollRef.current = clamped
        onSelectIndex(clamped)
      }
    },
    [
      itemHeight,
      containerHeight,
      paddedData.length,
      visibleRest,
      clampIndex,
      selectedIndex,
      onSelectIndex,
    ],
  )

  useEffect(() => {
    if (items.length === 0) return
    if (lastSelectedFromScrollRef.current === selectedIndex) {
      lastSelectedFromScrollRef.current = null
      return
    }
    flatListRef.current?.scrollToOffset({
      offset: (visibleRest + clampIndex(selectedIndex)) * itemHeight,
      animated: false,
    })
  }, [selectedIndex, items.length, itemHeight, visibleRest, clampIndex])

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
        onScrollEndDrag={handleMomentumScrollEnd}
        snapToOffsets={snapToOffsets}
        decelerationRate={'fast' as const}
        initialScrollIndex={Math.min(visibleRest + selectedIndex, paddedData.length - 1)}
        nestedScrollEnabled
      />
    </View>
  )
})

export default WheelPickerView
