import React, { memo, useCallback, useEffect, useRef } from 'react'
import { ScrollView, View } from 'react-native'
import { usePathname } from 'expo-router'
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import {
  ANIMATION_DURATION,
  HIGHLIGHT_ANIMATION_DURATION,
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

/** `withSpring` on react-native-web can get stuck mid-flight (never converges to the target,
 *  and its completion callback never fires) — `withTiming` doesn't have that issue. */
const HIGHLIGHT_TIMING = {
  duration: HIGHLIGHT_ANIMATION_DURATION,
  easing: Easing.out(Easing.cubic),
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

  /** Re-asserts the highlight's target on every write path (nav-triggered sync, remeasure,
   *  optimistic click) instead of gating on an animation-finished flag — `withSpring`'s
   *  completion callback isn't reliably invoked on react-native-web, so a "still animating"
   *  guard can get stuck and permanently block the highlight from ever moving again. */
  const syncHighlightFromLayouts = useCallback(() => {
    const layout = layoutsRef.current?.[activeIndexRef.current]
    highlightY.value = withTiming(layout?.y ?? 0, HIGHLIGHT_TIMING)
  }, [highlightY])

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
        highlightY.value = y
      }
    },
    [highlightY],
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
        cancelAnimation(highlightY)
        highlightY.value = withTiming(layout.y, HIGHLIGHT_TIMING)

        navigateTimeoutRef.current = setTimeout(() => {
          onSelectedProp?.(item, index)
        }, HIGHLIGHT_NAV_DELAY_MS)
        return
      }

      onSelectedProp?.(item, index)
    },
    [highlightY, onSelectedProp],
  )

  const showHighlight = activeIndex >= 0
  const isFlush = variant === 'flush'

  const listContent = (
    <View style={styles.listContent} collapsable={false}>
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
      fillParent
    >
      {header ? <View style={styles.header}>{header}</View> : null}
      <ScrollView style={styles.listScrollView} showsVerticalScrollIndicator={false}>
        {listContent}
      </ScrollView>
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
