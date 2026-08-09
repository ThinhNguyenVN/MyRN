import { memo, useCallback, useEffect, useRef } from 'react'
import { View, type TextStyle } from 'react-native'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import MyPressable from '@/components/elements/my-pressable'
import MyView from '@/components/elements/my-view'
import MyIcon from '@/components/elements/my-icon'
import type { SideBarRowProps } from './type'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { Typography } from '@/theme/typography'
import { ANIMATION_DURATION, generateStyles } from './styles'

function shouldShowChevron(item: SideBarRowProps['item']): boolean {
  if (item.showChevron !== undefined) return item.showChevron
  return !!item.href && !item.icon
}

function SideBarItemRow({
  item,
  index,
  isActive,
  onSelected,
  containerRef,
  onMeasureLayout,
}: SideBarRowProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const rowRef = useRef<View>(null)
  const progress = useSharedValue(isActive ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: ANIMATION_DURATION })
  }, [isActive, progress])

  const measureLayout = useCallback(() => {
    const container = containerRef?.current
    if (!rowRef.current || !container || !onMeasureLayout) return
    rowRef.current.measureLayout(
      container as any,
      (_x, y, _w, height) => {
        onMeasureLayout(index, y, height)
      },
      () => {},
    )
  }, [index, containerRef, onMeasureLayout])

  const textColorInactive = getColor('text/active/primary')
  const textColorActive = getColor('brand/white')
  const iconColorInactive = getColor('icon/active/primary')
  const iconColorActive = getColor('icon/active/tertiary')

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [textColorInactive, textColorActive]),
  }))

  const iconInactiveStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }))

  const iconActiveStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }))

  const showChevron = shouldShowChevron(item)
  const leadingIcon = item.icon
  const leadingIconFocused = item.iconFocused ?? item.icon

  const content = (
    <MyPressable
      onPress={onSelected}
      style={styles.itemRow}
      haptic={false}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={item.label}
    >
      {leadingIcon ? (
        <MyView style={styles.itemRowLeading}>
          <Animated.View style={iconInactiveStyle}>
            <MyIcon name={leadingIcon} size={22} color={iconColorInactive} />
          </Animated.View>
          <Animated.View style={[styles.iconLayer, iconActiveStyle]}>
            <MyIcon name={leadingIconFocused!} size={22} color={iconColorActive} />
          </Animated.View>
        </MyView>
      ) : null}
      <MyView style={styles.itemRowLabel}>
        <Animated.Text style={[Typography.body as TextStyle, textAnimatedStyle]}>
          {item.label}
        </Animated.Text>
      </MyView>
      {showChevron ? (
        <MyView style={styles.itemRowIcon}>
          <Animated.View style={iconInactiveStyle}>
            <MyIcon name="chevron-forward" size={20} color={iconColorInactive} />
          </Animated.View>
          <Animated.View style={[styles.iconLayer, iconActiveStyle]}>
            <MyIcon name="chevron-forward" size={20} color={iconColorActive} />
          </Animated.View>
        </MyView>
      ) : null}
    </MyPressable>
  )

  if (containerRef && onMeasureLayout) {
    return (
      <View ref={rowRef} onLayout={measureLayout} collapsable={false}>
        {content}
      </View>
    )
  }
  return content
}

export default memo(SideBarItemRow)
