import type { PropsWithChildren, ReactElement } from 'react'
import { useMemo } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { useTheme } from '@/theme/theme-context'

const HEADER_HEIGHT = 250

type Props = PropsWithChildren<{
  headerImage: ReactElement
  headerBackgroundColor: { dark: string; light: string }
  contentContainerStyle?: StyleProp<ViewStyle>
}>

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  contentContainerStyle,
}: Props) {
  const { getColor, themeName } = useTheme()
  const backgroundColor = getColor('fill/background/primary')
  const colorScheme = themeName
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useScrollOffset(scrollRef)
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    }
  })

  const contentStyle = [styles.content, styles.contentFullWidth]
  const scrollViewStyle = useMemo(() => [styles.scrollView, { backgroundColor }], [backgroundColor])
  const headerStyle = useMemo(
    () => [styles.header, { backgroundColor: headerBackgroundColor[colorScheme] }],
    [headerBackgroundColor, colorScheme],
  )

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={scrollViewStyle}
      contentContainerStyle={contentContainerStyle}
      scrollEventThrottle={16}
    >
      <Animated.View style={[...headerStyle, headerAnimatedStyle]}>{headerImage}</Animated.View>
      <MyView style={contentStyle}>{children}</MyView>
    </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentFullWidth: {
    width: '100%',
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
    overflow: 'hidden',
  },
})
