import React, { memo, useCallback, useEffect, useRef } from 'react'
import { FlatList, View } from 'react-native'
import { usePathname } from 'expo-router'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { HIGHLIGHT_ANIMATION_DURATION, generateStyles, ITEM_ROW_HEIGHT } from './styles'
import type { SideBarItem, SideBarProps } from './type'
import SideBarRow from './sider-bar-item'

function SideBarInner({
  data,
  elevation: elevationProp,
  style,
  onSelected: onSelectedProp,
  header,
  footer,
  variant = 'card',
  highlightColor,
}: SideBarProps) {
  const pathname = usePathname()
  const { defaultElevation } = useTheme()
  const elevation = elevationProp ?? (variant === 'flush' ? 'none' : defaultElevation)
  const styles = useThemedStyles(generateStyles)
  const listContentRef = useRef<View>(null)
  const layoutsRef = useRef<Record<number, { y: number; height: number }>>({})
  const activeIndexRef = useRef(0)
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pathMatchesHref = (href: string) => {
    if (!href) return false
    const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${escaped}(/|$)`).test(pathname)
  }
  const activeIndex = data.findIndex((item) => item.href && pathMatchesHref(item.href))
  activeIndexRef.current = activeIndex

  const highlightY = useSharedValue(0)
  const highlightHeight = useSharedValue(ITEM_ROW_HEIGHT)
  const isAnimating = useSharedValue(0)

  const highlightStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: highlightY.value,
        },
      ],
      height: highlightHeight.value,
    }
  }, [])

  const syncHighlightFromLayouts = useCallback(() => {
    if (isAnimating.value === 1) return
    const layout = layoutsRef.current?.[activeIndexRef.current]
    if (layout) {
      highlightY.value = layout.y
      highlightHeight.value = layout.height
    } else {
      highlightY.value = 0
      highlightHeight.value = ITEM_ROW_HEIGHT
    }
  }, [highlightY, highlightHeight, isAnimating])

  useEffect(() => {
    syncHighlightFromLayouts()
  }, [activeIndex, syncHighlightFromLayouts])

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current)
    }
  }, [])

  const handleMeasureLayout = useCallback(
    (index: number, y: number, height: number) => {
      const prev = layoutsRef.current[index]
      if (prev?.y === y && prev?.height === height) return
      layoutsRef.current = { ...layoutsRef.current, [index]: { y, height } }
      if (index === activeIndexRef.current) {
        if (isAnimating.value === 1) return
        highlightY.value = y
        highlightHeight.value = height
      }
    },
    [highlightY, highlightHeight, isAnimating],
  )

  const handleSelected = useCallback(
    (item: SideBarItem, index: number) => () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current)
        navigateTimeoutRef.current = null
      }

      const layout = layoutsRef.current?.[index]
      if (layout) {
        isAnimating.value = 1
        const config = {
          duration: HIGHLIGHT_ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
        }
        highlightY.value = withTiming(layout.y, config)
        highlightHeight.value = withTiming(layout.height, config, (finished) => {
          if (!finished) return
          isAnimating.value = 0
        })

        // Navigate after ~half animation: feels responsive, still reduces jank vs immediate navigate.
        const navigateDelay = Math.max(0, Math.round(HIGHLIGHT_ANIMATION_DURATION * 0.5))
        navigateTimeoutRef.current = setTimeout(() => {
          onSelectedProp?.(item, index)
        }, navigateDelay)
        return
      }

      onSelectedProp?.(item, index)
    },
    [highlightHeight, highlightY, isAnimating, onSelectedProp],
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
    (item: SideBarItem, index: number) => `${item.label}-${item.href ?? index}`,
    [],
  )

  const showHighlight = activeIndex >= 0
  const isFlush = variant === 'flush'

  const listContent = (
    <View ref={listContentRef} style={styles.listContent} collapsable={false}>
      {showHighlight && (
        <Animated.View
          style={[
            styles.highlight,
            highlightColor ? { backgroundColor: highlightColor } : null,
            highlightStyle,
          ]}
          pointerEvents="none"
        />
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
    <View style={[isFlush ? styles.sidebarOuterFlush : styles.sidebarOuter, style]}>
      <MyView
        elevation={elevation === 'none' ? undefined : elevation}
        style={isFlush ? styles.sidebarFlush : styles.sidebar}
        radius={isFlush ? 'none' : 'medium'}
      >
        {header ? <View style={styles.header}>{header}</View> : null}
        {listContent}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </MyView>
    </View>
  )
}

export default memo(SideBarInner)
