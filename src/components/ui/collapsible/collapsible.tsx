import { memo, useCallback, useEffect, useState } from 'react'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import CollapsibleContent from './collapsible-content'
import { generateStyles } from './styles'
import type { CollapsibleProps } from './type'

const ANIM_DURATION = 250

function Collapsible({ children, title }: CollapsibleProps) {
  const styles = useThemedStyles(generateStyles)
  const [isOpen, setIsOpen] = useState(false)
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withTiming(isOpen ? 1 : 0, { duration: ANIM_DURATION })
  }, [isOpen, rotation])

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotation.value, [0, 1], [0, 90])}deg` }],
  }))

  const handleToggle = useCallback(() => setIsOpen((value) => !value), [])

  return (
    <MyView style={styles.container}>
      <MyPressable style={styles.heading} onPress={handleToggle}>
        <Animated.View style={chevronAnimatedStyle}>
          <MyIcon name="chevron-forward" size={18} color="icon/active/primary" />
        </Animated.View>
        <MyText typography="label">{title}</MyText>
      </MyPressable>
      <CollapsibleContent isExpanded={isOpen} duration={ANIM_DURATION} innerStyle={styles.content}>
        {children}
      </CollapsibleContent>
    </MyView>
  )
}

export default memo(Collapsible)
