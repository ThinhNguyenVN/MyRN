import { memo, useCallback, useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MySurface from '@/components/elements/my-surface'
import { ANIMATION_DURATION } from '@/components/ui/side-bar/styles'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateSidebarCollapseToggleStyles } from './sidebar-collapse-toggle.styles'
import type { SidebarCollapseToggleProps } from './sidebar-collapse-toggle.type'

function SidebarCollapseToggleComponent({
  collapsed,
  onPress,
  accessibilityLabel,
}: SidebarCollapseToggleProps) {
  const { getColor } = useTheme()
  const styles = useThemedStyles(generateSidebarCollapseToggleStyles)
  const rotation = useSharedValue(collapsed ? 180 : 0)

  useEffect(() => {
    rotation.value = withTiming(collapsed ? 180 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    })
  }, [collapsed, rotation])

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const handlePress = useCallback(() => {
    onPress()
  }, [onPress])

  return (
    <MyPressable
      style={styles.root}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      haptic={false}
    >
      <MySurface elevation="soft/down/small" radius="full" fillParent style={styles.surface}>
        <Animated.View style={[styles.iconWrap, iconAnimatedStyle]}>
          <MyIcon name="chevron-back" size={18} color={getColor('icon/active/primary')} />
        </Animated.View>
      </MySurface>
    </MyPressable>
  )
}

export default memo(SidebarCollapseToggleComponent)
