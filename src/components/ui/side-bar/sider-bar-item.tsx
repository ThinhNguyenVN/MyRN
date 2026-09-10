import { memo, useCallback, useEffect } from 'react'
import { View, type LayoutChangeEvent, type TextStyle } from 'react-native'
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { isNil } from 'lodash'

import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import MyIcon from '@/components/elements/my-icon'
import { isWeb } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { Typography } from '@/theme/typography'

import type { SideBarRowProps } from './type'
import {
  ANIMATION_DURATION,
  ITEM_ROW_HEIGHT,
  SIDEBAR_ITEM_PADDING_COLLAPSED,
  SIDEBAR_ITEM_PADDING_EXPANDED,
  generateStyles,
} from './styles'

/** Same reasoning as `HIGHLIGHT_CSS_TRANSITION` in side-bar.tsx: CSS `transition` runs on the
 *  compositor, so color/opacity keep animating when a heavy screen blocks the JS main thread. */
function cssTransition(property: string) {
  return {
    transitionProperty: property,
    transitionDuration: `${ANIMATION_DURATION}ms`,
    transitionTimingFunction: 'ease',
  } as Record<string, string>
}

function shouldShowChevron(item: SideBarRowProps['item']): boolean {
  if (!isNil(item.showChevron)) {
    return item.showChevron
  }
  return Boolean(item.href) && !item.icon
}

function SideBarItemRow({
  item,
  index,
  isActive,
  onSelected,
  onMeasureLayout,
  collapseProgress,
}: SideBarRowProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const progress = useSharedValue(isActive ? 1 : 0)

  useEffect(() => {
    if (isWeb) {
      // Web drives color/opacity via a plain CSS transition instead (see `cssTransition`
      // below), so `progress` doesn't need to animate here.
      return
    }
    // `cancelAnimation` first: on react-native-web, assigning a new `withTiming` doesn't
    // reliably stop a still-running previous one (see side-bar.tsx), so a rapid re-toggle of
    // `isActive` can leave two competing animations racing on this row's color/opacity.
    cancelAnimation(progress)
    progress.value = withTiming(isActive ? 1 : 0, { duration: ANIMATION_DURATION })
  }, [isActive, progress])

  /** `event.nativeEvent.layout` is relative to this row's direct parent (`listContent`), so it
   *  stays correct regardless of how many scroll-container layers wrap that parent — unlike
   *  `measureLayout()`, whose cross-node DOM measurement on web breaks once the shared
   *  container sits inside a `ScrollView`'s own scrolling wrapper. */
  const measureLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!onMeasureLayout) {
        return
      }
      const { y, height } = event.nativeEvent.layout
      onMeasureLayout(index, y, height)
    },
    [index, onMeasureLayout],
  )

  const textColorInactive = getColor('text/active/primary')
  const textColorActive = getColor('brand/white')
  const iconColorInactive = getColor('icon/active/primary')
  const iconColorActive = getColor('icon/contrast/dark')

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    height: ITEM_ROW_HEIGHT,
    paddingLeft: interpolate(
      collapseProgress.value,
      [0, 1],
      [SIDEBAR_ITEM_PADDING_EXPANDED, SIDEBAR_ITEM_PADDING_COLLAPSED],
    ),
    paddingRight: interpolate(collapseProgress.value, [0, 1], [SIDEBAR_ITEM_PADDING_EXPANDED, 0]),
  }))

  const labelWrapAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP),
  }))

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP),
  }))

  const sectionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(collapseProgress.value, [0, 0.45], [1, 0], Extrapolation.CLAMP),
    maxHeight: interpolate(collapseProgress.value, [0, 1], [48, 0]),
    paddingTop: interpolate(collapseProgress.value, [0, 1], [16, 0]),
    paddingBottom: interpolate(collapseProgress.value, [0, 1], [8, 0]),
  }))

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [textColorInactive, textColorActive]),
  }))

  const iconInactiveStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }))

  const iconActiveStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }))

  if (item.kind === 'section') {
    return (
      <Animated.View
        style={[styles.sectionLabel, styles.sectionLayer, sectionAnimatedStyle]}
        collapsable={false}
      >
        <MyText typography="caption" color="text/inactive/primary">
          {item.label}
        </MyText>
      </Animated.View>
    )
  }

  const leadingIcon = item.icon
  const leadingIconFocused = item.iconFocused ?? item.icon
  const showChevron = shouldShowChevron(item)

  const content = (
    <Animated.View style={rowAnimatedStyle}>
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
            <Animated.View
              style={[
                iconInactiveStyle,
                isWeb ? [cssTransition('opacity'), { opacity: isActive ? 0 : 1 }] : null,
              ]}
            >
              <MyIcon name={leadingIcon} size={22} color={iconColorInactive} />
            </Animated.View>
            <Animated.View
              style={[
                styles.iconLayer,
                iconActiveStyle,
                isWeb ? [cssTransition('opacity'), { opacity: isActive ? 1 : 0 }] : null,
              ]}
            >
              <MyIcon name={leadingIconFocused!} size={22} color={iconColorActive} />
            </Animated.View>
          </MyView>
        ) : null}
        <Animated.View
          style={[
            styles.itemRowLabelWrap,
            showChevron ? styles.itemRowLabelWrapWithChevron : null,
            labelWrapAnimatedStyle,
          ]}
        >
          <Animated.Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              Typography.body as TextStyle,
              textAnimatedStyle,
              styles.itemRowLabel,
              isWeb
                ? [
                    cssTransition('color'),
                    { color: isActive ? textColorActive : textColorInactive },
                  ]
                : null,
            ]}
          >
            {item.label}
          </Animated.Text>
        </Animated.View>
        {showChevron ? (
          <Animated.View style={[styles.itemRowIcon, chevronAnimatedStyle]}>
            <MyIcon name="chevron-forward" size={20} color={iconColorInactive} />
          </Animated.View>
        ) : null}
      </MyPressable>
    </Animated.View>
  )

  if (onMeasureLayout) {
    return (
      <View style={styles.itemLayer} onLayout={measureLayout} collapsable={false}>
        {content}
      </View>
    )
  }

  return <View style={styles.itemLayer}>{content}</View>
}

export default memo(SideBarItemRow)
