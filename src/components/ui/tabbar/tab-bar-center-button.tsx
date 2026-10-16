import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { Image, type ImageSource } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import MyIcon from '@/components/elements/my-icon'
import MyPressable, { SCALE_SMALL } from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { isWeb } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'
import { triggerHaptic } from '@/utils/haptic'

import { generateTabBarStyles } from './styles'
import type { TabBarIconName } from './types'

export type TabBarCenterButtonProps = {
  label: string
  icon?: TabBarIconName
  /** Brand mark shown instead of `icon` when set (white, centered). */
  mark?: ImageSource | number
  onPress: () => void
  accessibilityLabel: string
  /** Small pill on the button's corner (e.g. "New"); hidden when empty. */
  badge?: string
  /** End color of the button gradient; defaults to the solid CTA fill. */
  accentColor?: string
  /** Layout style handed in by `BottomTabBar` (flex share of the bar). */
  style?: StyleProp<ViewStyle>
}

/**
 * Raised round action in the middle of the bottom tab bar. It runs `onPress` instead of
 * switching tabs, so the focused tab stays the same.
 */
function TabBarCenterButton({
  label,
  icon,
  mark,
  onPress,
  accessibilityLabel,
  badge,
  accentColor,
  style,
}: TabBarCenterButtonProps) {
  const styles = useThemedStyles(generateTabBarStyles)
  const { getColor } = useTheme()
  const fill = getColor('fill/active/primary')
  const labelColorStyle = useMemo(() => ({ color: getColor('brand/primary') }), [getColor])
  const gradient = useMemo(() => [fill, accentColor ?? fill] as const, [accentColor, fill])
  const flexStyle = useMemo(() => ({ flex: StyleSheet.flatten(style)?.flex ?? 1 }), [style])

  const handlePress = useCallback(() => {
    if (!isWeb) {
      triggerHaptic('Light')
    }
    onPress()
  }, [onPress])

  return (
    <MyPressable
      onPress={handlePress}
      scaleBySize={false}
      scaleValue={SCALE_SMALL}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.centerAction, flexStyle]}
    >
      <View style={styles.centerActionRing} pointerEvents="none">
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.centerActionCircle}
        >
          <ConditionRenderer
            when={Boolean(mark)}
            fallback={icon ? <MyIcon name={icon} size={26} color="icon/contrast/dark" /> : null}
          >
            <Image
              source={mark}
              style={styles.centerActionMark}
              contentFit="contain"
              tintColor={getColor('brand/white')}
            />
          </ConditionRenderer>
        </LinearGradient>
        {badge ? (
          <View style={styles.centerActionBadge}>
            <MyText
              typography="label"
              color="text/contrast/light"
              style={styles.centerActionBadgeText}
            >
              {badge}
            </MyText>
          </View>
        ) : null}
      </View>
      <MyText
        typography="label"
        numberOfLines={1}
        style={[styles.centerActionLabel, labelColorStyle]}
      >
        {label}
      </MyText>
    </MyPressable>
  )
}

export default memo(TabBarCenterButton)
