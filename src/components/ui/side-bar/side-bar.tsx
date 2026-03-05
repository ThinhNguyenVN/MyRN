import React, { memo, useCallback, useEffect, useRef } from 'react'
import { FlatList, View } from 'react-native'
import { router, usePathname } from 'expo-router'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { ANIMATION_DURATION, generateStyles, ITEM_ROW_HEIGHT } from './styles'
import type { SideBarItem, SideBarProps } from './type'
import SideBarRow from './sider-bar-item'

function SideBarInner({ data, elevation = 'soft/right/small', style }: SideBarProps) {
  const pathname = usePathname()
  const styles = useThemedStyles(generateStyles)
  const listContentRef = useRef<View>(null)
  const layoutsRef = useRef<Record<number, { y: number; height: number }>>({})
  const activeIndexRef = useRef(0)

  const activeIndex = data.findIndex(
    (item) => item.href && (pathname === item.href || pathname === item.href + '/'),
  )
  activeIndexRef.current = activeIndex

  const highlightY = useSharedValue(0)
  const highlightHeight = useSharedValue(ITEM_ROW_HEIGHT)

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(highlightY.value, { duration: ANIMATION_DURATION }),
      },
    ],
    height: withTiming(highlightHeight.value, { duration: ANIMATION_DURATION }),
  }))

  const syncHighlightFromLayouts = useCallback(() => {
    const layout = layoutsRef.current[activeIndexRef.current]
    if (layout) {
      highlightY.value = layout.y
      highlightHeight.value = layout.height
    } else {
      highlightY.value = 0
      highlightHeight.value = ITEM_ROW_HEIGHT
    }
  }, [highlightY, highlightHeight])

  useEffect(() => {
    syncHighlightFromLayouts()
  }, [activeIndex, syncHighlightFromLayouts])

  const handleMeasureLayout = useCallback(
    (index: number, y: number, height: number) => {
      const prev = layoutsRef.current[index]
      if (prev?.y === y && prev?.height === height) return
      layoutsRef.current = { ...layoutsRef.current, [index]: { y, height } }
      if (index === activeIndexRef.current) {
        highlightY.value = y
        highlightHeight.value = height
      }
    },
    [highlightY, highlightHeight],
  )

  const handleSelected = useCallback(
    (item: SideBarItem) => () => {
      if (item.href) {
        router.replace(item.href as any)
      }
    },
    [],
  )

  const renderItem = useCallback(
    ({ item, index }: { item: SideBarItem; index: number }) => (
      <SideBarRow
        item={item}
        index={index}
        isActive={index === activeIndex}
        onSelected={handleSelected(item)}
        containerRef={listContentRef}
        onMeasureLayout={handleMeasureLayout}
      />
    ),
    [activeIndex, handleSelected, handleMeasureLayout],
  )

  const keyExtractor = useCallback(
    (item: SideBarItem, index: number) => `${item.label}-${index}`,
    [],
  )

  const showHighlight = activeIndex >= 0

  const listContent = (
    <View ref={listContentRef} style={styles.listContent} collapsable={false}>
      {showHighlight && (
        <Animated.View style={[styles.highlight, highlightStyle]} pointerEvents="none" />
      )}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )

  return (
    <View style={styles.sidebarOuter}>
      <MyView elevation={elevation} style={[styles.sidebar, style]} radius="medium">
        {listContent}
      </MyView>
    </View>
  )
}

export default memo(SideBarInner)
