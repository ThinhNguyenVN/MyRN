import React, { memo, useMemo } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import MyPressable, { SCALE_SMALL } from '@/components/elements/my-pressable'
import { useThemedStyles } from '@/theme/theme-context'

import { generateTabBarStyles } from './styles'

const STRIP_LAYOUT_KEYS = [
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingHorizontal',
  'paddingVertical',
  'backgroundColor',
  'justifyContent',
] as const

function isTabFocused(props: Record<string, unknown>): boolean {
  if (props['aria-selected'] === true || props['aria-selected'] === 'true') return true
  const state = props.accessibilityState as { selected?: boolean } | undefined
  return state?.selected === true
}

function omitTabBarButtonLayout(style: StyleProp<ViewStyle>): ViewStyle {
  const incoming = StyleSheet.flatten(style) ?? {}
  const rest = { ...incoming } as ViewStyle
  for (const key of STRIP_LAYOUT_KEYS) {
    delete rest[key]
  }
  return rest
}

type TabBarButtonProps = Record<string, unknown> & {
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

function TabBarButton(props: TabBarButtonProps) {
  const styles = useThemedStyles(generateTabBarStyles)
  const focused = isTabFocused(props)
  const layoutStyle = useMemo(() => omitTabBarButtonLayout(props.style), [props.style])

  return (
    <MyPressable
      {...(props as any)}
      scaleBySize={false}
      scaleValue={SCALE_SMALL}
      style={[layoutStyle, styles.tabPressable]}
    >
      <View style={[styles.pill, focused ? styles.pillActive : null]} pointerEvents="none">
        {props.children}
      </View>
    </MyPressable>
  )
}

export default memo(TabBarButton)
