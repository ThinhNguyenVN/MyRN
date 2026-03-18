import React, { memo, useCallback, useEffect, useRef } from 'react'
import { FlatList, View } from 'react-native'
import { usePathname } from 'expo-router'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { ANIMATION_DURATION, generateStyles, ITEM_ROW_HEIGHT } from './styles'
import type { SideBarItem, SideBarProps } from './type'
import SideBarRow from './sider-bar-item'

function SideBarInner({
  data,
  elevation: elevationProp,
  style,
  onSelected: onSelectedProp,
}: SideBarProps) {
  const pathname = usePathname()
  const { defaultElevation } = useTheme()
  const elevation = elevationProp ?? defaultElevation
  const styles = useThemedStyles(generateStyles)
  const listContentRef = useRef<View>(null)
  const layoutsRef = useRef<Record<number, { y: number; height: number }>>({})
  const activeIndexRef = useRef(0)

  const pathMatchesHref = (href: string) => {
    if (!href) return false
    const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${escaped}(/|$)`).test(pathname)
  }
  const activeIndex = data.findIndex((item) => item.href && pathMatchesHref(item.href))
  activeIndexRef.current = activeIndex

  const highlightY = useSharedValue(0)
  const highlightHeight = useSharedValue(ITEM_ROW_HEIGHT)
  const userTappedSidebar = useSharedValue(false)

  const highlightStyle = useAnimatedStyle(() => {
    const duration = userTappedSidebar.value ? ANIMATION_DURATION : 0

    return {
      transform: [
        {
          translateY: withTiming(highlightY.value, { duration }),
        },
      ],
      height: withTiming(highlightHeight.value, { duration }),
    }
  }, [])

  const syncHighlightFromLayouts = useCallback(() => {
    const layout = layoutsRef.current?.[activeIndexRef.current]
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
    (item: SideBarItem, index: number) => () => {
      userTappedSidebar.value = true
      onSelectedProp?.(item, index)
    },
    [onSelectedProp, userTappedSidebar],
  )

  const renderItem = useCallback(
    ({ item, index }: { item: SideBarItem; index: number }) => (
      <SideBarRow
        item={item}
        index={index}
        isActive={index === activeIndex}
        onSelected={handleSelected(item, index)}
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
    <View style={[styles.sidebarOuter, style]}>
      <MyView elevation={elevation} style={styles.sidebar} radius="medium">
        {listContent}
      </MyView>
    </View>
  )
}

export default memo(SideBarInner)
