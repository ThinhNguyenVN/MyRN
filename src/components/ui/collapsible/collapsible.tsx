import type { PropsWithChildren } from 'react'
import { memo, useEffect, useState } from 'react'
import { TouchableOpacity, useColorScheme } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyText from '@/components/elements/my-text'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { Colors } from '@/constants/theme'

import { generateStyles } from './styles'
import CollapsibleContent from './collapsible-content'
import { useThemedStyles } from '@/theme/theme-context'
import MyView from '@/components/elements/my-view'

const ANIM_DURATION = 250

const Collapsible: React.FC<PropsWithChildren<{ title: string }>> = ({ children, title }) => {
  const styles = useThemedStyles(generateStyles)
  const [isOpen, setIsOpen] = useState(false)
  const theme = useColorScheme() ?? 'light'
  const rotation = useSharedValue(0)

  useEffect(() => {
    rotation.value = withTiming(isOpen ? 1 : 0, { duration: ANIM_DURATION })
  }, [isOpen, rotation])

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotation.value, [0, 1], [0, 90])}deg` }],
  }))

  const iconColor = theme === 'light' ? Colors.light.icon : Colors.dark.icon

  return (
    <MyView style={styles.container}>
      <TouchableOpacity style={styles.heading} onPress={() => setIsOpen((value) => !value)}>
        <Animated.View style={chevronAnimatedStyle}>
          <IconSymbol name="chevron.right" size={18} weight="medium" color={iconColor} />
        </Animated.View>
        <MyText typography="label">{title}</MyText>
      </TouchableOpacity>
      <CollapsibleContent isExpanded={isOpen} duration={ANIM_DURATION} innerStyle={styles.content}>
        {children}
      </CollapsibleContent>
    </MyView>
  )
}

export default memo(Collapsible)
