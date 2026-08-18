import React, { memo, useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { usePathname } from 'expo-router'
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import {
  ANIMATION_DURATION,
  ITEM_ROW_HEIGHT,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_FLUSH_WIDTH,
  SIDEBAR_COLLAPSED_ACTIVE_PILL_WIDTH,
  SIDEBAR_HIGHLIGHT_INSET_COLLAPSED,
  SIDEBAR_HIGHLIGHT_INSET_EXPANDED,
  SIDEBAR_HIGHLIGHT_WIDTH_EXPANDED,
  generateStyles,
} from './styles'
import type { SideBarItem, SideBarProps } from './type'
import SideBarRow from './sider-bar-item'

const HIGHLIGHT_SPRING = {
  damping: 22,
  stiffness: 260,
  mass: 0.75,
  overshootClamping: true,
  restSpeedThreshold: 0.8,
  restDisplacementThreshold: 0.5,
} as const

const HIGHLIGHT_NAV_DELAY_MS = 160

function SideBarInner({
  data,
  elevation: elevationProp,
  style,
  onSelected: onSelectedProp,
  header,
  footer,
  variant = 'card',
  highlightColor,
  collapsed = false,
  collapseProgress: collapseProgressProp,
}: SideBarProps) {
  const pathname = usePathname()
  const { defaultElevation } = useTheme()
  const elevation = elevationProp ?? (variant === 'flush' ? 'none' : defaultElevation)
  const styles = useThemedStyles(generateStyles)
  const listContentRef = useRef<View>(null)
  const layoutsRef = useRef<Record<number, { y: number; height: number }>>({})
  const activeIndexRef = useRef(0)
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const internalCollapseProgress = useSharedValue(collapsed ? 1 : 0)
  const collapseProgress: SharedValue<number> = collapseProgressProp ?? internalCollapseProgress

  const pathMatchesHref = (href: string) => {
    if (!href) return false
    const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${escaped}(/|$)`).test(pathname)
  }
  const activeIndex = data.findIndex(
    (item) => item.kind !== 'section' && item.href && pathMatchesHref(item.href),
  )
  activeIndexRef.current = activeIndex

  const highlightY = useSharedValue(0)
  const isAnimating = useSharedValue(0)

  useEffect(() => {
    if (collapseProgressProp) {
      return
    }
    internalCollapseProgress.value = withTiming(collapsed ? 1 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.cubic),
    })
  }, [collapseProgressProp, collapsed, internalCollapseProgress])

  const animatedRailStyle = useAnimatedStyle(() => ({
    width: interpolate(
      collapseProgress.value,
      [0, 1],
      [SIDEBAR_FLUSH_WIDTH, SIDEBAR_COLLAPSED_WIDTH],
    ),
  }))

  const highlightStyle = useAnimatedStyle(() => {
    const left = interpolate(
      collapseProgress.value,
      [0, 1],
      [SIDEBAR_HIGHLIGHT_INSET_EXPANDED, SIDEBAR_HIGHLIGHT_INSET_COLLAPSED],
    )
    const width = interpolate(
      collapseProgress.value,
      [0, 1],
      [SIDEBAR_HIGHLIGHT_WIDTH_EXPANDED, SIDEBAR_COLLAPSED_ACTIVE_PILL_WIDTH],
    )

    return {
      transform: [{ translateY: highlightY.value }],
      height: ITEM_ROW_HEIGHT,
      left,
      width,
    }
  })

  const syncHighlightFromLayouts = useCallback(() => {
    if (isAnimating.value === 1) {
      return
    }
    const layout = layoutsRef.current?.[activeIndexRef.current]
    if (layout) {
      highlightY.value = layout.y
    } else {
      highlightY.value = 0
    }
  }, [highlightY, isAnimating])

  useEffect(() => {
    syncHighlightFromLayouts()
  }, [activeIndex, syncHighlightFromLayouts])

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current)
      }
    }
  }, [])

  const handleMeasureLayout = useCallback(
    (index: number, y: number, height: number) => {
      const prev = layoutsRef.current[index]
      if (prev?.y === y && prev?.height === height) {
        return
      }
      layoutsRef.current = { ...layoutsRef.current, [index]: { y, height } }
      if (index === activeIndexRef.current) {
        if (isAnimating.value === 1) {
          return
        }
        highlightY.value = y
      }
    },
    [highlightY, isAnimating],
  )

  const handleSelected = useCallback(
    (item: SideBarItem, index: number) => () => {
      if (item.kind === 'section') {
        return
      }
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current)
        navigateTimeoutRef.current = null
      }

      const layout = layoutsRef.current?.[index]
      if (layout) {
        isAnimating.value = 1
        cancelAnimation(highlightY)
        highlightY.value = withSpring(layout.y, HIGHLIGHT_SPRING, (finished) => {
          if (!finished) {
            return
          }
          isAnimating.value = 0
        })

        navigateTimeoutRef.current = setTimeout(() => {
          onSelectedProp?.(item, index)
        }, HIGHLIGHT_NAV_DELAY_MS)
        return
      }

      onSelectedProp?.(item, index)
    },
    [highlightY, isAnimating, onSelectedProp],
  )

  const showHighlight = activeIndex >= 0
  const isFlush = variant === 'flush'

  const listContent = (
    <View ref={listContentRef} style={styles.listContent} collapsable={false}>
      {showHighlight ? (
        <Animated.View
          style={[
            styles.highlight,
            highlightColor ? { backgroundColor: highlightColor } : null,
            highlightStyle,
          ]}
          pointerEvents="none"
        />
      ) : null}
      {data.map((item, index) => (
        <SideBarRow
          key={`${item.kind ?? 'link'}-${item.label}-${item.href ?? index}`}
          item={item}
          index={index}
          isActive={index === activeIndex}
          onSelected={handleSelected(item, index)}
          containerRef={listContentRef}
          onMeasureLayout={handleMeasureLayout}
          collapseProgress={collapseProgress}
        />
      ))}
    </View>
  )

  const railBody = (
    <MyView
      elevation={elevation === 'none' ? undefined : elevation}
      style={isFlush ? styles.sidebarFlush : styles.sidebar}
      radius={isFlush ? 'none' : 'medium'}
    >
      {header ? <View style={styles.header}>{header}</View> : null}
      {listContent}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </MyView>
  )

  if (!isFlush) {
    return <View style={[styles.sidebarOuter, style]}>{railBody}</View>
  }

  return (
    <View style={[styles.sidebarOuterFlush, style]}>
      <Animated.View style={[styles.sidebarRailAnimated, animatedRailStyle]}>
        {railBody}
      </Animated.View>
    </View>
  )
}

export default memo(SideBarInner)
