import { memo, useMemo, useRef, type ReactNode } from 'react'
import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated'

import MySegment from '@/components/elements/my-segment'
import MyView from '@/components/elements/my-view'
import { isAndroid } from '@/constants/dimensions'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MyTabSwitcherProps } from './type'

const DEFAULT_DURATION = 220

/**
 * Tab switcher tái sử dụng — truyền mảng tabs + renderContent theo id.
 * Nội dung slide theo hướng chuyển (tab bên phải trượt từ phải vào và ngược lại).
 */
function MyTabSwitcher<TId extends string = string>({
  tabs,
  activeId,
  onChange,
  renderContent,
  duration = DEFAULT_DURATION,
  fillParent = true,
  containerStyle,
  tabBarStyle,
}: MyTabSwitcherProps<TId>) {
  const styles = useThemedStyles(generateStyles)

  const prevActiveIndexRef = useRef<number>(
    Math.max(
      0,
      tabs.findIndex((tab) => tab.id === activeId),
    ),
  )
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeId),
  )
  const prevIndex = prevActiveIndexRef.current
  const didChangeTab = prevIndex !== activeIndex
  if (didChangeTab) {
    prevActiveIndexRef.current = activeIndex
  }
  /**
   * Skip entering on first mount — and on Android entirely.
   * Reanimated SlideIn* uses absolute layout while entering; inside a
   * ScrollView on Android that pins the tab body to the top of the screen
   * (Dashboard top-sellers overlaying KPIs on first open).
   */
  const entering =
    isAndroid || !didChangeTab
      ? undefined
      : activeIndex >= prevIndex
        ? SlideInRight.duration(duration)
        : SlideInLeft.duration(duration)

  const segmentOptions = useMemo(
    () =>
      tabs.map((tab) => ({
        value: tab.id,
        label: tab.label,
      })),
    [tabs],
  )

  return (
    <MyView style={[fillParent ? styles.root : styles.rootHug, containerStyle]}>
      <MyView style={[styles.tabBar, tabBarStyle]}>
        <MySegment fill options={segmentOptions} value={activeId} onChange={onChange} />
      </MyView>
      <Animated.View
        key={`tab-content-${activeId}`}
        entering={entering}
        style={fillParent ? styles.contentWrap : styles.contentWrapHug}
      >
        {renderContent(activeId)}
      </Animated.View>
    </MyView>
  )
}

/**
 * memo() xoá generic của function component — cast để giữ nguyên TId khi dùng trong JSX.
 */
export default memo(MyTabSwitcher) as <TId extends string>(
  props: MyTabSwitcherProps<TId>,
) => ReactNode
