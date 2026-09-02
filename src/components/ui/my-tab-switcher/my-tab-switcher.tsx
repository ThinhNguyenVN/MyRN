import { memo, useCallback, useRef, type ReactNode } from 'react'
import type { AccessibilityState } from 'react-native'
import Animated, { SlideInLeft, SlideInRight } from 'react-native-reanimated'

import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MyTabItem, MyTabSwitcherProps } from './type'

const DEFAULT_DURATION = 220

interface TabItemProps<TId extends string> {
  readonly tab: MyTabItem<TId>
  readonly isActive: boolean
  readonly onChange: (id: TId) => void
  readonly styles: ReturnType<typeof generateStyles>
}

function TabItemInner<TId extends string>({ tab, isActive, onChange, styles }: TabItemProps<TId>) {
  const handlePress = useCallback(() => onChange(tab.id), [onChange, tab.id])
  const accessibilityState: AccessibilityState = { selected: isActive }

  return (
    <MyPressable
      style={[styles.tabItem, isActive ? styles.tabItemActive : null]}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
      accessibilityLabel={tab.label}
    >
      <MyText
        typography="button"
        style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}
      >
        {tab.label}
      </MyText>
    </MyPressable>
  )
}

const TabItem = memo(TabItemInner) as <TId extends string>(props: TabItemProps<TId>) => ReactNode

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
  if (prevIndex !== activeIndex) {
    prevActiveIndexRef.current = activeIndex
  }
  /** Chuyển sang tab bên phải → nội dung mới trượt từ phải vào. */
  const entering =
    activeIndex >= prevIndex ? SlideInRight.duration(duration) : SlideInLeft.duration(duration)

  return (
    <MyView style={[styles.root, containerStyle]}>
      <MyView style={[styles.tabBar, tabBarStyle]}>
        {tabs.map((tab) => (
          <TabItem
            key={`tab-switcher-${tab.id}`}
            tab={tab}
            isActive={tab.id === activeId}
            onChange={onChange}
            styles={styles}
          />
        ))}
      </MyView>
      <Animated.View key={`tab-content-${activeId}`} entering={entering} style={styles.contentWrap}>
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
