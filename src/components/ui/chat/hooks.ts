import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
  type TextInputScrollEvent,
} from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import { useKeyboardState, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { isWeb, MAX_CHAT_WIDTH, NAVIGATION_BAR_HEIGHT } from '@/constants/dimensions'
import { useTheme } from '@/theme/theme-context'

import { COMPOSER_ACTIONS_HEIGHT, MIN_COMPOSER_HEIGHT } from './styles'

export { COMPOSER_ACTIONS_HEIGHT, MIN_COMPOSER_HEIGHT }

const COMPOSER_LAYOUT_DEFAULTS = {
  isExpanded: false,
  isInputScrollable: false,
  contentHeight: MIN_COMPOSER_HEIGHT,
  isRemeasuring: false,
  isCollapsing: false,
}

export function getChatColumnGutter(
  containerWidth: number,
  isMobileSize: boolean,
  spacingX6: number,
): number {
  if (isMobileSize) {
    return spacingX6
  }
  if (containerWidth <= 0) {
    return 0
  }
  return Math.max(0, (containerWidth - MAX_CHAT_WIDTH) / 2)
}

const INPUT_MAX_VIEWPORT_GAP = 20
const COMPOSER_RESIZE_ANIMATION_MS = 180
const COMPOSER_RESIZE_EASING = Easing.out(Easing.cubic)
const COLLAPSE_PULL_THRESHOLD = 56
const COLLAPSE_PULL_VELOCITY = 900
const COLLAPSE_RESIZE_CONFIG = {
  duration: COMPOSER_RESIZE_ANIMATION_MS,
  easing: COMPOSER_RESIZE_EASING,
}

export function useComposerInputLayout() {
  const { getSpacing, insets, isMobileSize } = useTheme()
  const { height: windowHeight } = useWindowDimensions()
  const { progress } = useReanimatedKeyboardAnimation()
  const keyboardHeight = useKeyboardState((state) => (state.isVisible ? state.height : 0))
  const keyboardOpenPadding = 0
  const keyboardClosedPadding = insets.bottom ? getSpacing('x4') : keyboardOpenPadding

  const [isExpanded, setIsExpanded] = useState(COMPOSER_LAYOUT_DEFAULTS.isExpanded)
  const [isInputScrollable, setIsInputScrollable] = useState(
    COMPOSER_LAYOUT_DEFAULTS.isInputScrollable,
  )
  const [contentHeight, setContentHeight] = useState(COMPOSER_LAYOUT_DEFAULTS.contentHeight)
  const [isRemeasuring, setIsRemeasuring] = useState(COMPOSER_LAYOUT_DEFAULTS.isRemeasuring)
  const [isCollapsing, setIsCollapsing] = useState(COMPOSER_LAYOUT_DEFAULTS.isCollapsing)
  const [inputResetKey, setInputResetKey] = useState(0)

  const naturalContentHeightRef = useRef(MIN_COMPOSER_HEIGHT)
  const isExpandedRef = useRef(isExpanded)
  isExpandedRef.current = isExpanded
  const isCollapsingRef = useRef(false)
  const isResettingRef = useRef(false)
  const isHeightLocked = isExpanded || isInputScrollable
  const isClipHeight = isHeightLocked || isCollapsing

  const animatedInputHeight = useSharedValue(MIN_COMPOSER_HEIGHT)
  const expandIconRotation = useSharedValue(0)
  const isExpandedSV = useSharedValue(0)
  const composerMaxHeightSV = useSharedValue(MIN_COMPOSER_HEIGHT)
  const inputScrollY = useSharedValue(0)
  const collapsePrevTouchY = useSharedValue(0)

  const headerHeight = (insets.top ?? 0) + NAVIGATION_BAR_HEIGHT
  const composerFooterHeight =
    (isMobileSize ? COMPOSER_ACTIONS_HEIGHT + getSpacing('x2') : 0) +
    (keyboardHeight > 0 ? keyboardOpenPadding : keyboardClosedPadding)
  const composerMaxHeight = Math.max(
    MIN_COMPOSER_HEIGHT,
    windowHeight - keyboardHeight - headerHeight - composerFooterHeight - INPUT_MAX_VIEWPORT_GAP,
  )

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
    overflow: 'hidden' as const,
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

  const applyMeasuredHeight = useCallback(
    (nextHeightRaw: number) => {
      const nextHeight = Math.max(MIN_COMPOSER_HEIGHT, Math.ceil(nextHeightRaw))
      if (isExpandedRef.current) {
        if (nextHeight > composerMaxHeight + 1) {
          naturalContentHeightRef.current = nextHeight
        }
        return
      }
      if (isResettingRef.current) {
        return
      }
      if (
        isCollapsingRef.current &&
        nextHeight <= MIN_COMPOSER_HEIGHT + 1 &&
        naturalContentHeightRef.current > MIN_COMPOSER_HEIGHT + 1
      ) {
        return
      }
      naturalContentHeightRef.current = nextHeight
      setContentHeight(nextHeight)
      setIsRemeasuring(false)
      setIsInputScrollable(nextHeight > composerMaxHeight)
      if (isCollapsingRef.current) {
        isCollapsingRef.current = false
        setAnimatedInputHeight(nextHeight, true, () => {
          setIsCollapsing(false)
        })
        return
      }
      setAnimatedInputHeight(nextHeight, false)
    },
    [composerMaxHeight, setAnimatedInputHeight],
  )

  const applyTextLayout = useCallback(
    (next: string, previousLength: number) => {
      const didShrink = next.length < previousLength
      if (isExpandedRef.current) {
        return
      }
      if (didShrink && !isWeb) {
        setIsInputScrollable(false)
        setIsRemeasuring(true)
        setContentHeight(MIN_COMPOSER_HEIGHT)
        setAnimatedInputHeight(MIN_COMPOSER_HEIGHT, false)
      }
      if (next.length === 0) {
        naturalContentHeightRef.current = MIN_COMPOSER_HEIGHT
        setIsRemeasuring(false)
      }
      if (next.length > 0) {
        isResettingRef.current = false
      }
    },
    [setAnimatedInputHeight],
  )

  const handleContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      applyMeasuredHeight(event.nativeEvent.contentSize.height)
    },
    [applyMeasuredHeight],
  )

  useEffect(() => {
    composerMaxHeightSV.value = composerMaxHeight
    if (isExpandedRef.current) {
      setAnimatedInputHeight(composerMaxHeight, false)
      return
    }
    if (isCollapsingRef.current) {
      return
    }
    setIsInputScrollable(naturalContentHeightRef.current > composerMaxHeight)
    setAnimatedInputHeight(naturalContentHeightRef.current, false)
  }, [composerMaxHeight, composerMaxHeightSV, setAnimatedInputHeight])

  useEffect(() => {
    if (!isCollapsing) {
      return
    }
    const timeoutId = setTimeout(() => {
      if (!isCollapsingRef.current) {
        return
      }
      applyMeasuredHeight(Math.max(naturalContentHeightRef.current, MIN_COMPOSER_HEIGHT))
    }, 80)
    return () => clearTimeout(timeoutId)
  }, [applyMeasuredHeight, isCollapsing])

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
    animateExpandIcon(false)
    isCollapsingRef.current = true
    setIsCollapsing(true)
    setIsExpanded(false)
    setIsInputScrollable(false)
    setIsRemeasuring(true)
    setContentHeight(MIN_COMPOSER_HEIGHT)
  }, [animateExpandIcon])

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
      const offsetY = event.nativeEvent?.contentOffset?.y
      if (typeof offsetY === 'number') {
        inputScrollY.value = offsetY
      }
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

  const resetComposerLayout = useCallback(() => {
    isResettingRef.current = true
    isCollapsingRef.current = false
    isExpandedRef.current = false
    naturalContentHeightRef.current = COMPOSER_LAYOUT_DEFAULTS.contentHeight
    setIsExpanded(COMPOSER_LAYOUT_DEFAULTS.isExpanded)
    setIsInputScrollable(COMPOSER_LAYOUT_DEFAULTS.isInputScrollable)
    setContentHeight(COMPOSER_LAYOUT_DEFAULTS.contentHeight)
    setIsRemeasuring(COMPOSER_LAYOUT_DEFAULTS.isRemeasuring)
    setIsCollapsing(COMPOSER_LAYOUT_DEFAULTS.isCollapsing)
    cancelAnimation(animatedInputHeight)
    animatedInputHeight.value = COMPOSER_LAYOUT_DEFAULTS.contentHeight
    expandIconRotation.value = 0
    isExpandedSV.value = 0
    inputScrollY.value = 0
    setInputResetKey((current) => current + 1)
  }, [animatedInputHeight, expandIconRotation, inputScrollY, isExpandedSV])

  return {
    isMobileSize,
    isExpanded,
    isInputScrollable,
    isHeightLocked,
    isClipHeight,
    isRemeasuring,
    contentHeight,
    composerMaxHeight,
    animatedComposerPaddingStyle,
    animatedInputAreaStyle,
    expandIconAnimatedStyle,
    collapsePanGesture,
    applyTextLayout,
    applyMeasuredHeight,
    handleContentSizeChange,
    handleInputScroll,
    handleToggleExpand,
    resetComposerLayout,
    inputResetKey,
  }
}
