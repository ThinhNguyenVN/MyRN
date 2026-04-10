import React, { memo, useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

import MyText from '@/components/elements/my-text'
import { useThemedStyles } from '@/theme/theme-context'

import type { FormFieldErrorProps } from './types'
import { generateStyles } from './styles'

const DURATION_MS = 200
const MAX_HEIGHT_COLLAPSED = 0
const MAX_HEIGHT_VISIBLE = 20

function FormFieldError({ error, style: styleProp }: FormFieldErrorProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const visible = useSharedValue(!!error?.message)
  useEffect(() => {
    visible.value = !!error?.message
  }, [error?.message, visible])
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible.value ? 1 : 0, { duration: DURATION_MS }),
    height: withTiming(visible.value ? MAX_HEIGHT_VISIBLE : MAX_HEIGHT_COLLAPSED, {
      duration: DURATION_MS,
    }),
  }))
  return (
    <Animated.View style={[styles.error, styleProp, animatedStyle]}>
      {error?.message ? (
        <MyText typography="caption" color="text/alert/primary">
          {t(error.message)}
        </MyText>
      ) : null}
    </Animated.View>
  )
}

export default memo(FormFieldError)
