import React, { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import {
  TYPING_DOT_EASING,
  TYPING_DOT_HALF_CYCLE_MS,
  TYPING_DOT_OPACITY_MAX,
  TYPING_DOT_OPACITY_MIN,
  TYPING_DOT_SCALE_MAX,
  TYPING_DOT_SCALE_MIN,
  TYPING_DOT_STAGGER_MS,
} from './constants'
import { generateStyles } from './styles'

interface TypingDotProps {
  index: number
}

function TypingDot({ index }: TypingDotProps) {
  const styles = useThemedStyles(generateStyles)
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(
      index * TYPING_DOT_STAGGER_MS,
      withRepeat(
        withSequence(
          withTiming(1, { duration: TYPING_DOT_HALF_CYCLE_MS, easing: TYPING_DOT_EASING }),
          withTiming(0, { duration: TYPING_DOT_HALF_CYCLE_MS, easing: TYPING_DOT_EASING }),
        ),
        -1,
        false,
      ),
    )

    return () => {
      cancelAnimation(progress)
    }
  }, [index, progress])

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value
    return {
      opacity: TYPING_DOT_OPACITY_MIN + (TYPING_DOT_OPACITY_MAX - TYPING_DOT_OPACITY_MIN) * t,
      transform: [
        {
          scale: TYPING_DOT_SCALE_MIN + (TYPING_DOT_SCALE_MAX - TYPING_DOT_SCALE_MIN) * t,
        },
      ],
    }
  })

  return <Animated.View style={[styles.typingDot, animatedStyle]} />
}

function MyChatTyping() {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  return (
    <MyView
      style={styles.typingRow}
      accessibilityRole="progressbar"
      accessibilityLabel={t('components.chat.typing')}
    >
      <TypingDot index={0} />
      <TypingDot index={1} />
      <TypingDot index={2} />
    </MyView>
  )
}

export default memo(MyChatTyping)
