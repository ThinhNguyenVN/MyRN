import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
  type TextInputScrollEvent,
} from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import {
  useGenericKeyboardHandler,
  useKeyboardState,
  useReanimatedKeyboardAnimation,
} from 'react-native-keyboard-controller'
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

import { isWeb, NAVIGATION_BAR_HEIGHT } from '@/constants/dimensions'
import { useTheme } from '@/theme/theme-context'

import { COMPOSER_ACTIONS_HEIGHT, MIN_COMPOSER_HEIGHT } from './styles'

export { COMPOSER_ACTIONS_HEIGHT, MIN_COMPOSER_HEIGHT }

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
  const { getSpacing, insets, isMobile } = useTheme()
  const { height: windowHeight } = useWindowDimensions()
  const { progress } = useReanimatedKeyboardAnimation()
  const keyboardHeight = useKeyboardState((state) => (state.isVisible ? state.height : 0))
  const keyboardOpenPadding = 0
  const keyboardClosedPadding = insets.bottom ? getSpacing('x4') : keyboardOpenPadding

  const [isExpanded, setIsExpanded] = useState(false)
  /** Content is taller than the ceiling: the field scrolls internally instead of growing. */
  const [isOverflowing, setIsOverflowing] = useState(false)
  /** Web only: a textarea has no intrinsic auto-grow, so its height is measured. */
  const [contentHeight, setContentHeight] = useState(MIN_COMPOSER_HEIGHT)

  const isExpandedRef = useRef(isExpanded)
  isExpandedRef.current = isExpanded

  /**
   * Height FLOOR of the input area (px). `0` means "not driven": the field keeps its
   * natural content height, which native grows on its own while `scrollEnabled` is
   * false. Nothing measured ever sets the height, so a stale or missing measurement
   * can no longer clip text. Expanding raises the floor to the ceiling; collapsing
   * animates it back to 0, which lands exactly on the current text height.
   */
  const expandedMinHeight = useSharedValue(0)
  const expandIconRotation = useSharedValue(0)
  const isExpandedSV = useSharedValue(0)
  const composerMaxHeightSV = useSharedValue(MIN_COMPOSER_HEIGHT)
  const inputScrollY = useSharedValue(0)
  const collapsePrevTouchY = useSharedValue(0)

  const headerHeight = (insets.top ?? 0) + NAVIGATION_BAR_HEIGHT
  const composerFooterHeight =
    (isMobile ? COMPOSER_ACTIONS_HEIGHT + getSpacing('x2') : 0) +
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
    minHeight: expandedMinHeight.value,
    maxHeight: composerMaxHeightSV.value,
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

  const setExpandedMinHeight = useCallback(
    (next: number, animate: boolean) => {
      const clamped = Math.min(Math.max(next, 0), composerMaxHeight)
      if (!animate) {
        expandedMinHeight.value = clamped
        return
      }
      expandedMinHeight.value = withTiming(clamped, {
        duration: COMPOSER_RESIZE_ANIMATION_MS,
        easing: COMPOSER_RESIZE_EASING,
      })
    },
    [composerMaxHeight, expandedMinHeight],
  )

  /** Measurement drives ONLY internal scrolling (and the web textarea's height). */
  const applyMeasuredHeight = useCallback(
    (nextHeightRaw: number) => {
      const nextHeight = Math.max(MIN_COMPOSER_HEIGHT, Math.ceil(nextHeightRaw))
      setIsOverflowing(nextHeight > composerMaxHeight)
      if (isWeb) {
        setContentHeight(nextHeight)
      }
    },
    [composerMaxHeight],
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
      // Keyboard opened/closed while expanded: re-clamp the floor to the new ceiling.
      setExpandedMinHeight(composerMaxHeight, true)
    }
  }, [composerMaxHeight, composerMaxHeightSV, setExpandedMinHeight])

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
    isExpandedRef.current = false
    animateExpandIcon(false)
    setIsExpanded(false)
    setExpandedMinHeight(0, true)
  }, [animateExpandIcon, setExpandedMinHeight])

  const handleToggleExpand = useCallback(() => {
    if (isExpanded) {
      collapseComposer()
      return
    }
    isExpandedRef.current = true
    animateExpandIcon(true)
    setIsExpanded(true)
    setExpandedMinHeight(composerMaxHeight, true)
  }, [animateExpandIcon, collapseComposer, composerMaxHeight, isExpanded, setExpandedMinHeight])

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
          expandedMinHeight.value = Math.min(
            composerMaxHeightSV.value,
            Math.max(0, composerMaxHeightSV.value - Math.max(0, e.translationY)),
          )
        })
        .onEnd((e) => {
          'worklet'
          if (isExpandedSV.value !== 1) {
            return
          }
          const pulled = composerMaxHeightSV.value - expandedMinHeight.value
          if (pulled >= COLLAPSE_PULL_THRESHOLD || e.velocityY > COLLAPSE_PULL_VELOCITY) {
            runOnJS(collapseComposer)()
            return
          }
          expandedMinHeight.value = withTiming(composerMaxHeightSV.value, COLLAPSE_RESIZE_CONFIG)
        }),
    [
      collapseComposer,
      collapsePrevTouchY,
      composerMaxHeightSV,
      expandedMinHeight,
      inputScrollY,
      isExpanded,
      isExpandedSV,
    ],
  )

  /** After sending: the text is cleared, so the field falls back to one line by itself. */
  const resetComposerLayout = useCallback(() => {
    isExpandedRef.current = false
    setIsExpanded(false)
    setIsOverflowing(false)
    setContentHeight(MIN_COMPOSER_HEIGHT)
    cancelAnimation(expandedMinHeight)
    expandedMinHeight.value = 0
    expandIconRotation.value = 0
    isExpandedSV.value = 0
    inputScrollY.value = 0
  }, [expandIconRotation, expandedMinHeight, inputScrollY, isExpandedSV])

  return {
    isMobileComposer: isMobile,
    isExpanded,
    isOverflowing,
    contentHeight,
    composerMaxHeight,
    animatedComposerPaddingStyle,
    animatedInputAreaStyle,
    expandIconAnimatedStyle,
    collapsePanGesture,
    applyMeasuredHeight,
    handleContentSizeChange,
    handleInputScroll,
    handleToggleExpand,
    resetComposerLayout,
  }
}

/**
 * Keeps the chat list anchored to the bottom message when the keyboard opens/closes,
 * without doing any per-frame JS work: `useGenericKeyboardHandler`'s `onEnd` fires
 * exactly once per keyboard transition (worklet, UI thread), and we bridge to JS only on
 * that single edge via `runOnJS`. We deliberately use the *generic* variant (not
 * `useKeyboardHandler`) because it does not toggle Android's resize-mode window setting
 * on mount/unmount — MyChatList mounts/unmounts whenever `hasMessages` flips (empty state
 * vs list), while the composer's own `useReanimatedKeyboardAnimation` already owns that
 * setting for the lifetime of the screen; using the non-generic hook here would fight it.
 * If the user was already pinned to the bottom before the
 * transition started, we issue one `scrollToEnd({ animated: false })` right as the
 * transition settles — this replaces FlashList's own, unpredictably-timed internal
 * re-layout snap (the "extra jump after the keyboard is already up" symptom) with a
 * single deterministic correction tied to the keyboard's own finish event.
 *
 * Known limitation: if the user was scrolled away from the bottom when the keyboard
 * moved, we intentionally do nothing — re-anchoring an arbitrary mid-list message
 * would require driving FlashList's scroll offset in lockstep with the keyboard
 * animation every frame, which FlashList v2 has no cheap (non-bridge) API for today.
 */
export function useKeyboardScrollAnchor(
  scrollToEnd: () => void,
  isAtBottomRef: { current: boolean },
) {
  const handleTransitionEnd = useCallback(() => {
    if (isAtBottomRef.current) {
      scrollToEnd()
    }
  }, [isAtBottomRef, scrollToEnd])

  useGenericKeyboardHandler(
    {
      onEnd: () => {
        'worklet'
        if (isWeb) {
          return
        }
        runOnJS(handleTransitionEnd)()
      },
    },
    [handleTransitionEnd],
  )
}
