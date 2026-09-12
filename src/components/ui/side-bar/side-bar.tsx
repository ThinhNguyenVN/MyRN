import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
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
import { isWeb } from '@/constants/dimensions'
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
import { computeSidebarHighlightY } from './utils'

/** `withSpring` on react-native-web can get stuck mid-flight (never converges to the target,
 *  and its completion callback never fires) — `withTiming` doesn't have that issue. */
const HIGHLIGHT_TIMING = {
  duration: HIGHLIGHT_ANIMATION_DURATION,
  easing: Easing.out(Easing.cubic),
} as const

const HIGHLIGHT_NAV_DELAY_MS = 160

/** On web, Reanimated `withTiming` interpolates on the JS main thread, so it stalls whenever a
 *  heavy screen (e.g. a big list re-render) blocks that thread. A real CSS `transition` runs on
 *  the compositor instead. Native already animates on its UI thread, so it keeps `withTiming`. */
const HIGHLIGHT_CSS_TRANSITION = isWeb
  ? ({
      transitionProperty: 'transform',
      transitionDuration: `${HIGHLIGHT_ANIMATION_DURATION}ms`,
      transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    } as Record<string, string>)
  : null

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
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightTargetRef = useRef<number | null>(null)

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

  const highlightYExpanded = useSharedValue(computeSidebarHighlightY(data, activeIndex, false))
  const highlightYCollapsed = useSharedValue(computeSidebarHighlightY(data, activeIndex, true))
  const [highlightYWeb, setHighlightYWeb] = useState(() =>
    computeSidebarHighlightY(data, activeIndex, collapsed),
  )

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
      transform: [
        {
          translateY: interpolate(
            collapseProgress.value,
            [0, 1],
            [highlightYExpanded.value, highlightYCollapsed.value],
          ),
        },
      ],
      height: ITEM_ROW_HEIGHT,
      left,
      width,
    }
  })

  /** Web pill Y is a CSS `transform` (compositor). Skip no-op writes so collapse/nav do not jitter. */
  const animateHighlightTo = useCallback((y: number) => {
    if (highlightTargetRef.current === y) {
      return
    }
    highlightTargetRef.current = y
    setHighlightYWeb(y)
  }, [])

  const moveHighlightToIndex = useCallback(
    (index: number) => {
      const yExpanded = computeSidebarHighlightY(data, index, false)
      const yCollapsed = computeSidebarHighlightY(data, index, true)
      const yNow = collapsed ? yCollapsed : yExpanded

      if (isWeb) {
        highlightYExpanded.value = yExpanded
        highlightYCollapsed.value = yCollapsed
        animateHighlightTo(yNow)
        return
      }

      cancelAnimation(highlightYExpanded)
      cancelAnimation(highlightYCollapsed)
      highlightYExpanded.value = withTiming(yExpanded, HIGHLIGHT_TIMING)
      highlightYCollapsed.value = withTiming(yCollapsed, HIGHLIGHT_TIMING)
    },
    [animateHighlightTo, collapsed, data, highlightYCollapsed, highlightYExpanded],
  )

  useEffect(() => {
    if (activeIndex < 0) {
      return
    }
    moveHighlightToIndex(activeIndex)
  }, [activeIndex, collapsed, moveHighlightToIndex])

  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current)
      }
    }
  }, [])

  const handleSelected = useCallback(
    (item: SideBarItem, index: number) => () => {
      if (item.kind === 'section') {
        return
      }
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current)
        navigateTimeoutRef.current = null
      }

      moveHighlightToIndex(index)
      navigateTimeoutRef.current = setTimeout(() => {
        onSelectedProp?.(item, index)
      }, HIGHLIGHT_NAV_DELAY_MS)
    },
    [moveHighlightToIndex, onSelectedProp],
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
            isWeb
              ? [HIGHLIGHT_CSS_TRANSITION, { transform: [{ translateY: highlightYWeb }] }]
              : null,
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
