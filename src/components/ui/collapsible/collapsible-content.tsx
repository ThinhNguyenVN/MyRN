import type { PropsWithChildren } from 'react'
import { memo, useCallback } from 'react'
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'

import { generateStyles } from './styles'
import { useThemedStyles } from '@/theme/theme-context'

type CollapsibleContentProps = PropsWithChildren<{
  isExpanded: boolean | SharedValue<boolean>
  duration?: number
  style?: StyleProp<ViewStyle>
  containerStyle?: StyleProp<ViewStyle>
  innerStyle?: StyleProp<ViewStyle>
}>

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  isExpanded,
  duration = 250,
  style,
  containerStyle,
  innerStyle,
}) => {
  const styles = useThemedStyles(generateStyles)
  const height = useSharedValue<number>(0)

  const bodyStyle = useAnimatedStyle(() => ({
    height: withTiming(
      height.value * Number(typeof isExpanded === 'boolean' ? isExpanded : isExpanded.value),
      {
        duration,
      },
    ),
    opacity: withTiming((typeof isExpanded === 'boolean' ? isExpanded : isExpanded.value) ? 1 : 0, {
      duration,
    }),
  }))

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      height.value = e.nativeEvent.layout.height
    },
    [height],
  )

  return (
    <Animated.View style={[styles.animatedView, bodyStyle, style, containerStyle]}>
      <View onLayout={onLayout} style={[styles.wrapper, innerStyle]}>
        {children}
      </View>
    </Animated.View>
  )
}

export default memo(CollapsibleContent)
