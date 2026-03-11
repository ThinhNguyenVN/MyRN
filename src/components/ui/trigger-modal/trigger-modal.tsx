import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Portal } from '@gorhom/portal'

import { MAX_INPUT_WIDTH } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { TriggerModalProps } from './type'
import MyView from '@/components/elements/my-view'

const DEFAULT_ESTIMATED_HEIGHT = 320
const DEFAULT_SAFE_INSET = 24
const FADE_DURATION = 200

const TriggerModal = memo(function TriggerModal({
  visible,
  onClose,
  triggerLayout,
  children,
  footer,
  panelMinWidth,
  estimatedPanelHeight = DEFAULT_ESTIMATED_HEIGHT,
  safeInset = DEFAULT_SAFE_INSET,
  panelStyle,
  contentContainerStyle,
  footerContainerStyle,
}: TriggerModalProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
  const gap = getSpacing('x1')
  const opacity = useSharedValue(0)
  const [isExiting, setIsExiting] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const wasVisibleRef = useRef(false)

  const panelLayout = useMemo(() => {
    if (!triggerLayout) return null
    const { x, y, width, height } = triggerLayout
    const windowHeight = Dimensions.get('window').height
    const spaceBelow = windowHeight - (y + height + gap) - safeInset
    const openAbove = spaceBelow < estimatedPanelHeight
    const panelWidth = Math.min(MAX_INPUT_WIDTH, Math.max(width, panelMinWidth ?? 0))
    const maxHeightBelow = windowHeight - (y + height + gap) - safeInset
    const maxHeightAbove = y - gap - safeInset
    return {
      left: x,
      width: panelWidth,
      top: openAbove ? undefined : y + height + gap,
      bottom: openAbove ? windowHeight - y + gap : undefined,
      maxHeight: openAbove ? maxHeightAbove : maxHeightBelow,
    }
  }, [triggerLayout, gap, safeInset, estimatedPanelHeight, panelMinWidth])

  const finishExit = useCallback(() => {
    setIsExiting(false)
    wasVisibleRef.current = false
  }, [])

  useEffect(() => {
    if (visible) {
      wasVisibleRef.current = true
      setIsExiting(false)
    } else {
      setContentReady(false)
      if (wasVisibleRef.current) {
        setIsExiting(true)
        opacity.value = withTiming(
          0,
          { duration: FADE_DURATION },
          (finished) => finished && runOnJS(finishExit)(),
        )
      }
    }
  }, [visible, opacity, finishExit])

  /** Khi unmount (vd: Metro reload), dọn state để lần mount sau không bị kẹt. */
  useEffect(
    () => () => {
      wasVisibleRef.current = false
    },
    [],
  )

  useEffect(() => {
    if (visible && contentReady) {
      opacity.value = withTiming(1, { duration: FADE_DURATION })
    }
  }, [visible, contentReady, opacity])

  const animatedBackdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  if (!triggerLayout) return null
  if (!visible && !isExiting && !wasVisibleRef.current) return null

  /** Khi đang thoát (isExiting), cho touch xuyên qua để tránh block màn hình nếu Metro reload / callback không chạy. */
  const allowPointerEvents = visible && !isExiting

  return (
    <Portal hostName="root">
      <Animated.View
        style={[StyleSheet.absoluteFillObject, animatedBackdropStyle]}
        pointerEvents={allowPointerEvents ? 'auto' : 'none'}
      >
        <Pressable style={[StyleSheet.absoluteFillObject, styles.backdrop]} onPress={onClose}>
          <MyView
            elevation={'soft/down/small'}
            radius="medium"
            style={[
              styles.panel,
              panelLayout && {
                left: panelLayout.left,
                width: panelLayout.width,
                top: panelLayout.top,
                bottom: panelLayout.bottom,
                maxHeight: Math.max(200, panelLayout.maxHeight),
              },
              panelStyle,
            ]}
          >
            <MyView style={contentContainerStyle} onLayout={() => setContentReady(true)}>
              {children}
            </MyView>
            {!!footer ? (
              <View style={[styles.footerWrap, footerContainerStyle]}>{footer}</View>
            ) : null}
          </MyView>
        </Pressable>
      </Animated.View>
    </Portal>
  )
})

TriggerModal.displayName = 'TriggerModal'

export default TriggerModal
