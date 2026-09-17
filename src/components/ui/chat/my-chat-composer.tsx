import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
  type TextInputScrollEvent,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useKeyboardState, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import MyBottomSheet, { type MyBottomSheetRef } from '@/components/elements/my-bottom-sheet'
import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { pickImage, pickImageFromCamera } from '@/components/ui/image-picker'
import { isWeb, NAVIGATION_BAR_HEIGHT } from '@/constants/dimensions'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import MyChatComposerInput from './my-chat-composer-input'
import { generateStyles } from './styles'

const MIN_COMPOSER_HEIGHT = 24
const COMPOSER_ACTIONS_HEIGHT = 40
const INPUT_MAX_VIEWPORT_GAP = 20
const COMPOSER_RESIZE_ANIMATION_MS = 180
const COMPOSER_RESIZE_EASING = Easing.out(Easing.cubic)
const COLLAPSE_PULL_THRESHOLD = 56
const COLLAPSE_PULL_VELOCITY = 900
const COLLAPSE_RESIZE_CONFIG = {
  duration: COMPOSER_RESIZE_ANIMATION_MS,
  easing: COMPOSER_RESIZE_EASING,
}

export interface MyChatComposerProps {
  onSend: (text: string) => void
  onSendImage: (imageUri: string) => void
  disabled?: boolean
}

function MyChatComposer({ onSend, onSendImage, disabled = false }: MyChatComposerProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing, insets } = useTheme()
  const { height: windowHeight } = useWindowDimensions()
  const { t } = useTranslation()
  const { progress } = useReanimatedKeyboardAnimation()
  const keyboardHeight = useKeyboardState((state) => (state.isVisible ? state.height : 0))
  const keyboardOpenPadding = getSpacing('x3')
  const keyboardClosedPadding = insets.bottom ?? keyboardOpenPadding
  const [text, setText] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isInputScrollable, setIsInputScrollable] = useState(false)
  const [contentHeight, setContentHeight] = useState(MIN_COMPOSER_HEIGHT)
  const [isRemeasuring, setIsRemeasuring] = useState(false)
  const attachSheetRef = useRef<MyBottomSheetRef>(null)
  const hasText = text.trim().length > 0
  const naturalContentHeightRef = useRef(MIN_COMPOSER_HEIGHT)
  const isExpandedRef = useRef(isExpanded)
  isExpandedRef.current = isExpanded
  const isHeightLocked = isExpanded || isInputScrollable
  const animatedInputHeight = useSharedValue(MIN_COMPOSER_HEIGHT)
  const expandIconRotation = useSharedValue(0)
  const isExpandedSV = useSharedValue(0)
  const composerMaxHeightSV = useSharedValue(MIN_COMPOSER_HEIGHT)
  const inputScrollY = useSharedValue(0)
  const collapsePrevTouchY = useSharedValue(0)
  const headerHeight = (insets.top ?? 0) + NAVIGATION_BAR_HEIGHT
  const composerFooterHeight =
    COMPOSER_ACTIONS_HEIGHT +
    getSpacing('x2') +
    (keyboardHeight > 0 ? keyboardOpenPadding : keyboardClosedPadding)
  const composerMaxHeight = Math.max(
    MIN_COMPOSER_HEIGHT,
    windowHeight - keyboardHeight - headerHeight - composerFooterHeight - INPUT_MAX_VIEWPORT_GAP,
  )

  // Home-indicator inset is only needed when the composer sits on the screen bottom.
  // Once the keyboard is up, that inset is already "inside" the keyboard — keep x3.
  const animatedComposerPaddingStyle = useAnimatedStyle(() => ({
    paddingBottom: isWeb
      ? keyboardClosedPadding
      : interpolate(
          progress.value,
          [0, 1],
          [keyboardClosedPadding, keyboardOpenPadding],
          Extrapolation.CLAMP,
        ),
  }))

  const animatedInputAreaStyle = useAnimatedStyle(() => ({
    height: animatedInputHeight.value,
    overflow: 'hidden',
  }))
  const expandIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${expandIconRotation.value}deg` }],
  }))

  const animateExpandIcon = useCallback(
    (expanded: boolean) => {
      expandIconRotation.value = withTiming(expanded ? 180 : 0, {
        duration: COMPOSER_RESIZE_ANIMATION_MS,
        easing: COMPOSER_RESIZE_EASING,
      })
    },
    [expandIconRotation],
  )

  const setAnimatedInputHeight = useCallback(
    (next: number, animate: boolean, onFinished?: () => void) => {
      const clamped = Math.min(Math.max(next, MIN_COMPOSER_HEIGHT), composerMaxHeight)
      if (!animate) {
        animatedInputHeight.value = clamped
        return
      }
      animatedInputHeight.value = withTiming(
        clamped,
        {
          duration: COMPOSER_RESIZE_ANIMATION_MS,
          easing: COMPOSER_RESIZE_EASING,
        },
        (finished) => {
          if (finished && onFinished) {
            runOnJS(onFinished)()
          }
        },
      )
    },
    [animatedInputHeight, composerMaxHeight],
  )

  const finishCollapse = useCallback(() => {
    setIsExpanded(false)
    setIsInputScrollable(naturalContentHeightRef.current > composerMaxHeight)
  }, [composerMaxHeight])

  const handleChangeText = useCallback(
    (next: string) => {
      const didShrink = next.length < text.length
      setText(next)
      if (isExpanded) {
        return
      }
      // Drop the grown minHeight so the field can remeasure smaller. While minHeight
      // stays at the previous content size, iOS never reports a shorter contentSize.
      if (didShrink) {
        setIsInputScrollable(false)
        setIsRemeasuring(true)
        setContentHeight(MIN_COMPOSER_HEIGHT)
        setAnimatedInputHeight(MIN_COMPOSER_HEIGHT, false)
      }
      if (next.length === 0) {
        naturalContentHeightRef.current = MIN_COMPOSER_HEIGHT
        setIsRemeasuring(false)
      }
    },
    [isExpanded, setAnimatedInputHeight, text.length],
  )

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const nextHeight = Math.max(
        MIN_COMPOSER_HEIGHT,
        Math.ceil(event.nativeEvent.contentSize.height),
      )
      if (isExpanded) {
        if (nextHeight > composerMaxHeight + 1) {
          naturalContentHeightRef.current = nextHeight
        }
        return
      }
      naturalContentHeightRef.current = nextHeight
      setContentHeight(nextHeight)
      setIsRemeasuring(false)
      setIsInputScrollable(nextHeight > composerMaxHeight)
      setAnimatedInputHeight(nextHeight, false)
    },
    [composerMaxHeight, isExpanded, setAnimatedInputHeight],
  )

  useEffect(() => {
    composerMaxHeightSV.value = composerMaxHeight
    if (isExpandedRef.current) {
      setAnimatedInputHeight(composerMaxHeight, false)
      return
    }
    setIsInputScrollable(naturalContentHeightRef.current > composerMaxHeight)
    setAnimatedInputHeight(naturalContentHeightRef.current, false)
  }, [composerMaxHeight, composerMaxHeightSV, setAnimatedInputHeight])

  useEffect(() => {
    isExpandedSV.value = isExpanded ? 1 : 0
    if (!isExpanded) {
      inputScrollY.value = 0
    }
  }, [inputScrollY, isExpanded, isExpandedSV])

  const collapseComposer = useCallback(() => {
    if (!isExpandedRef.current) {
      return
    }
    // Keep the input locked at max until the wrapper finishes shrinking, otherwise
    // unlocking on the first frame lets contentSize snap height and kill withTiming.
    animateExpandIcon(false)
    setAnimatedInputHeight(naturalContentHeightRef.current, true, finishCollapse)
  }, [animateExpandIcon, finishCollapse, setAnimatedInputHeight])

  const handleToggleExpand = useCallback(() => {
    if (isExpanded) {
      collapseComposer()
      return
    }
    animateExpandIcon(true)
    setIsExpanded(true)
    setAnimatedInputHeight(composerMaxHeight, true)
  }, [animateExpandIcon, collapseComposer, composerMaxHeight, isExpanded, setAnimatedInputHeight])

  const handleInputScroll = useCallback(
    (event: TextInputScrollEvent) => {
      inputScrollY.value = event.nativeEvent.contentOffset.y
    },
    [inputScrollY],
  )

  const collapsePanGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isWeb && isExpanded)
        .manualActivation(true)
        .onTouchesDown((e) => {
          'worklet'
          if (e.changedTouches.length > 0) {
            collapsePrevTouchY.value = e.changedTouches[0].y
          }
        })
        .onTouchesMove((e, stateManager) => {
          'worklet'
          if (isExpandedSV.value !== 1 || e.changedTouches.length === 0) {
            return
          }
          const currentY = e.changedTouches[0].y
          const dy = currentY - collapsePrevTouchY.value
          collapsePrevTouchY.value = currentY
          if (dy > 0 && inputScrollY.value <= 1) {
            stateManager.activate()
            return
          }
          if (inputScrollY.value > 1) {
            stateManager.fail()
          }
        })
        .onUpdate((e) => {
          'worklet'
          if (isExpandedSV.value !== 1) {
            return
          }
          const next = Math.min(
            composerMaxHeightSV.value,
            Math.max(MIN_COMPOSER_HEIGHT, composerMaxHeightSV.value - Math.max(0, e.translationY)),
          )
          animatedInputHeight.value = next
        })
        .onEnd((e) => {
          'worklet'
          if (isExpandedSV.value !== 1) {
            return
          }
          const pulled = composerMaxHeightSV.value - animatedInputHeight.value
          if (pulled >= COLLAPSE_PULL_THRESHOLD || e.velocityY > COLLAPSE_PULL_VELOCITY) {
            runOnJS(collapseComposer)()
            return
          }
          animatedInputHeight.value = withTiming(composerMaxHeightSV.value, COLLAPSE_RESIZE_CONFIG)
        }),
    [
      animatedInputHeight,
      collapseComposer,
      collapsePrevTouchY,
      isExpanded,
      composerMaxHeightSV,
      inputScrollY,
      isExpandedSV,
    ],
  )

  const handleSend = useCallback(() => {
    if (!text.trim() || disabled) {
      return
    }
    const toSend = text
    setText('')
    naturalContentHeightRef.current = MIN_COMPOSER_HEIGHT
    setContentHeight(MIN_COMPOSER_HEIGHT)
    setIsRemeasuring(false)
    setIsInputScrollable(false)
    setIsExpanded(false)
    setAnimatedInputHeight(MIN_COMPOSER_HEIGHT, true)
    animateExpandIcon(false)
    onSend(toSend)
  }, [animateExpandIcon, disabled, onSend, setAnimatedInputHeight, text])

  const runPick = useCallback(
    async (source: 'camera' | 'library') => {
      attachSheetRef.current?.close()
      try {
        const picked = source === 'camera' ? await pickImageFromCamera() : await pickImage()
        onSendImage(picked.uri)
      } catch {
        // Cancel / permission-denied — no destination surface in Phase 1-4; silently ignore.
      }
    },
    [onSendImage],
  )

  const handlePickCamera = useCallback(() => {
    void runPick('camera')
  }, [runPick])

  const handlePickLibrary = useCallback(() => {
    void runPick('library')
  }, [runPick])

  const handleAttachPress = useCallback(() => {
    if (isWeb) {
      void runPick('library')
      return
    }
    attachSheetRef.current?.open()
  }, [runPick])

  return (
    <MyView style={styles.composerRoot} elevation={'soft/up/small'} radius="large">
      <Animated.View style={[styles.composerBody, animatedComposerPaddingStyle]}>
        <GestureDetector gesture={collapsePanGesture}>
          <Animated.View
            style={[styles.composerInputArea, isHeightLocked ? animatedInputAreaStyle : null]}
          >
            <MyChatComposerInput
              value={text}
              onChangeText={handleChangeText}
              onContentSizeChange={handleContentSizeChange}
              onScroll={handleInputScroll}
              multiline
              blurOnSubmit={false}
              scrollEnabled={isExpanded || isInputScrollable}
              lockHeight={isHeightLocked && !isRemeasuring}
              minHeight={MIN_COMPOSER_HEIGHT}
              contentHeight={contentHeight}
              lockedHeight={composerMaxHeight}
              editable
              placeholder={t('components.chat.composerPlaceholder')}
            />
          </Animated.View>
        </GestureDetector>

        <MyView style={styles.composerActionsRow}>
          <MyPressable
            onPress={handleAttachPress}
            disabled={disabled}
            hitSlop={8}
            style={styles.composerIconButton}
            accessibilityLabel={t('components.chat.attach')}
          >
            <MyIcon name="add" size={24} color="icon/active/primary" />
          </MyPressable>

          <MyView style={styles.composerActionsSpacer} />

          <MyPressable
            onPress={handleToggleExpand}
            hitSlop={8}
            style={styles.expandButton}
            accessibilityRole="button"
            accessibilityLabel={t(
              isExpanded ? 'components.chat.collapse' : 'components.chat.expand',
            )}
          >
            <Animated.View style={expandIconAnimatedStyle}>
              <MyIcon name="chevron-up" size={22} color="icon/active/primary" />
            </Animated.View>
          </MyPressable>

          <MyPressable
            onPress={handleSend}
            disabled={disabled || !hasText}
            hitSlop={8}
            style={[
              styles.sendButtonBase,
              hasText ? styles.sendButtonActiveFill : styles.sendButtonInactiveFill,
            ]}
            accessibilityLabel={t('components.chat.send')}
          >
            <MyIcon
              name="send"
              size={18}
              color={hasText ? 'icon/active/primary' : 'icon/inactive/primary'}
            />
          </MyPressable>
        </MyView>
      </Animated.View>

      <ConditionRenderer when={!isWeb}>
        <MyBottomSheet
          ref={attachSheetRef}
          title={t('components.chat.attachTitle')}
          pressBackdropToClose
          contentContainerStyle={styles.sourceSheetBody}
        >
          <MyButton
            text={t('components.chat.attachCamera')}
            left={<MyIcon name="camera-outline" size={18} color="icon/active/primary" />}
            type="light"
            size="small"
            width="full"
            elevation="none"
            onPress={handlePickCamera}
          />
          <MyButton
            text={t('components.chat.attachLibrary')}
            left={<MyIcon name="images-outline" size={18} color="icon/active/primary" />}
            type="light"
            size="small"
            width="full"
            elevation="none"
            onPress={handlePickLibrary}
          />
        </MyBottomSheet>
      </ConditionRenderer>
    </MyView>
  )
}

export default memo(MyChatComposer)
