import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { LayoutChangeEvent, useWindowDimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { isWeb } from '@/constants/dimensions'
import { useThemedStyles } from '@/theme/theme-context'
import { triggerHaptic } from '@/utils/haptic'
import { isNil } from 'lodash'

import {
  COMMIT_EXTRA,
  DELETE_SLIDE_MS,
  DELETE_UNDERLAY_FADE_MS,
  MIN_QUICK,
  OPEN_FRACTION,
  PREVIEW_FRAC,
  SETTLE_DURATION_MS,
  SWIPEABLE_ITEM_ROW_ENTERING,
  SWIPEABLE_ITEM_ROW_EXITING,
  VELOCITY_MENU_LEEWAY_FRAC,
  VEL_DELETE,
} from './constants'
import { useSwipeableItemOptional } from './swipe-item-context'
import { SwipeableRowPressProvider } from './swipe-row-press'
import { SwipeableActionStrip } from './swipeable-action-strip'
import { generateStyles, stripWidthPx } from './styles'
import { CARD_SHELL_RADIUS, useCardShell } from './use-card-shell'
import type { SwipeableItemProps, SwipeableItemRef } from './types'

/** Block the synthetic click / Pressable onPress that follows a pan on web. */
const SUPPRESS_PRESS_AFTER_PAN_MS = 450
/** Treat row as “open” — tap content closes instead of navigating. */
const OPEN_PRESS_IGNORE_PX = 8

const hapticDelete = () => {
  triggerHaptic('Medium')
}

/** Distance a strip must be dragged past to commit a swipe-to-delete on its side. Zero-width
 *  strips (no actions on that side) still get `COMMIT_EXTRA` alone, so a swipe past that point
 *  on an empty side commits too (see the `left`/`right` demo rows in the playground screen). */
function commitThreshold(stripWidth: number) {
  'worklet'
  return stripWidth > 0 ? stripWidth + COMMIT_EXTRA : COMMIT_EXTRA
}

export const SwipeableItem = forwardRef<SwipeableItemRef, SwipeableItemProps>(
  function SwipeableItem(
    {
      rowKey,
      children,
      leftActions = [],
      rightActions = [],
      onDelete,
      swipeToRemove,
      testID,
      elevation,
      cardStyle,
    },
    ref,
  ) {
    const styles = useThemedStyles(generateStyles)
    const { width: windowWidth } = useWindowDimensions()
    const swipeableItem = useSwipeableItemOptional()
    const [clipWidth, setClipWidth] = useState(0)

    const translateX = useSharedValue(0)
    const underlayOpacity = useSharedValue(1)
    const rowWidth = useSharedValue(0)
    const screenW = useSharedValue(windowWidth)
    const leftStripSV = useSharedValue(0)
    const rightStripSV = useSharedValue(0)
    const dragStartX = useSharedValue(0)
    const leftDelHapticDone = useSharedValue(0)
    const rightDelHapticDone = useSharedValue(0)
    const gestureNeedsFinalize = useSharedValue(0)
    const allowSwipeRemovePlusSV = useSharedValue(1)
    const allowSwipeRemoveMinusSV = useSharedValue(1)

    useEffect(() => {
      screenW.value = windowWidth
    }, [windowWidth, screenW])

    useEffect(() => {
      const both = swipeToRemove === 'both' ? 1 : 0
      const rightOnly = swipeToRemove === 'right' ? 1 : 0
      const leftOnly = swipeToRemove === 'left' ? 1 : 0
      allowSwipeRemovePlusSV.value = isNil(swipeToRemove) ? 0 : both | rightOnly
      allowSwipeRemoveMinusSV.value = isNil(swipeToRemove) ? 0 : both | leftOnly
    }, [swipeToRemove, allowSwipeRemovePlusSV, allowSwipeRemoveMinusSV])

    const onDeleteRef = useRef(onDelete)
    onDeleteRef.current = onDelete

    const leftStripPx = useMemo(() => stripWidthPx(leftActions.length), [leftActions.length])
    const rightStripPx = useMemo(() => stripWidthPx(rightActions.length), [rightActions.length])

    useEffect(() => {
      leftStripSV.value = leftStripPx
      rightStripSV.value = rightStripPx
    }, [leftStripPx, rightStripPx, leftStripSV, rightStripSV])

    useEffect(() => {
      translateX.value = 0
      underlayOpacity.value = 1
      gestureNeedsFinalize.value = 0
    }, [rowKey, translateX, underlayOpacity, gestureNeedsFinalize])

    const close = useCallback(() => {
      runOnUI(() => {
        'worklet'
        translateX.value = withTiming(0, {
          duration: SETTLE_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        })
      })()
    }, [translateX])

    useImperativeHandle(ref, () => ({ close }), [close])

    const runDelete = useCallback(() => {
      onDeleteRef.current()
    }, [])

    const notifyPanBegin = useCallback(() => {
      swipeableItem?.onRowPanBegin(rowKey, close)
    }, [close, swipeableItem, rowKey])

    const notifyPanBeginRef = useRef(notifyPanBegin)
    notifyPanBeginRef.current = notifyPanBegin

    const invokeNotifyPanBeginOnJS = useCallback(() => {
      notifyPanBeginRef.current()
    }, [])

    const suppressPressUntilRef = useRef(0)

    const markPressSuppressed = useCallback(() => {
      suppressPressUntilRef.current = Date.now() + SUPPRESS_PRESS_AFTER_PAN_MS
    }, [])

    const shouldIgnorePress = useCallback(() => {
      if (Date.now() < suppressPressUntilRef.current) {
        return true
      }
      // Tap while menu open → close, do not navigate.
      if (Math.abs(translateX.value) > OPEN_PRESS_IGNORE_PX) {
        close()
        markPressSuppressed()
        return true
      }
      return false
    }, [close, markPressSuppressed, translateX])

    const rowPressValue = useMemo(() => ({ shouldIgnorePress }), [shouldIgnorePress])

    /** Content-only: do not attach to action strips (delete/edit must stay clickable). */
    const onContentClickCapture = useCallback(
      (event: { stopPropagation?: () => void; preventDefault?: () => void }) => {
        if (Date.now() >= suppressPressUntilRef.current) {
          return
        }
        event.preventDefault?.()
        event.stopPropagation?.()
      },
      [],
    )

    /**
     * Row is [leftStrip][content][rightStrip]. Rest keeps content flush left by offsetting
     * -leftStrip; gesture translateX is relative to that rest (0 = closed).
     */
    const rowStyle = useAnimatedStyle(() => ({
      opacity: underlayOpacity.value,
      transform: [{ translateX: translateX.value - leftStripSV.value }],
    }))

    const pan = useMemo(() => {
      const settle = (vx: number) => {
        'worklet'
        const x = translateX.value
        const lw = leftStripSV.value
        const rsw = rightStripSV.value
        const rw = rowWidth.value
        const sw = screenW.value
        const wRow = Math.max(rw, 1)
        const exitPad = sw * 0.28 + 72
        const exitDistPos = wRow + exitPad
        const exitDistNeg = -(wRow + exitPad)

        const commitL = commitThreshold(lw)
        const commitR = commitThreshold(rsw)

        const velocityOpenLeft = lw > 0 ? lw * VELOCITY_MENU_LEEWAY_FRAC : 0
        const velocityOpenRight = rsw > 0 ? rsw * VELOCITY_MENU_LEEWAY_FRAC : 0

        const commitSwipeDelete = (targetX: number) => {
          'worklet'
          underlayOpacity.value = withTiming(0, {
            duration: DELETE_UNDERLAY_FADE_MS,
            easing: Easing.out(Easing.quad),
          })
          translateX.value = withTiming(
            targetX,
            { duration: DELETE_SLIDE_MS, easing: Easing.out(Easing.cubic) },
            (finished) => {
              if (finished) {
                runOnJS(runDelete)()
              }
            },
          )
        }

        const deletePlus =
          allowSwipeRemovePlusSV.value === 1 &&
          (x >= commitL - 2 || (vx > VEL_DELETE && x > MIN_QUICK + velocityOpenLeft))
        if (deletePlus) {
          commitSwipeDelete(exitDistPos)
          return
        }

        const deleteMinus =
          allowSwipeRemoveMinusSV.value === 1 &&
          (x <= -commitR + 2 || (vx < -VEL_DELETE && x < -MIN_QUICK - velocityOpenRight))
        if (deleteMinus) {
          commitSwipeDelete(exitDistNeg)
          return
        }

        const settleTiming = {
          duration: SETTLE_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        }
        if (lw > 0 && x > lw * OPEN_FRACTION) {
          translateX.value = withTiming(lw, settleTiming)
          return
        }
        if (rsw > 0 && x < -rsw * OPEN_FRACTION) {
          translateX.value = withTiming(-rsw, settleTiming)
          return
        }
        translateX.value = withTiming(0, settleTiming)
      }

      return Gesture.Pan()
        .activeOffsetX([-18, 18])
        .failOffsetY([-22, 22])
        .onBegin(() => {
          'worklet'
          gestureNeedsFinalize.value = 1
          dragStartX.value = translateX.value
          leftDelHapticDone.value = 0
          rightDelHapticDone.value = 0
          runOnJS(invokeNotifyPanBeginOnJS)()
        })
        .onStart(() => {
          'worklet'
          // Pan activated (past activeOffset) — block the trailing click/press on web.
          runOnJS(markPressSuppressed)()
        })
        .onUpdate((e) => {
          'worklet'
          const rw = rowWidth.value
          const lw = leftStripSV.value
          const rsw = rightStripSV.value
          const preview = Math.max(rw * PREVIEW_FRAC, 96)
          let next = dragStartX.value + e.translationX
          const maxX = lw > 0 ? lw + COMMIT_EXTRA + preview : 0
          const minX = rsw > 0 ? -(rsw + COMMIT_EXTRA + preview) : 0
          if (next > maxX) {
            next = maxX
          }
          if (next < minX) {
            next = minX
          }
          translateX.value = next

          const commitL = commitThreshold(lw)
          if (
            allowSwipeRemovePlusSV.value === 1 &&
            next > commitL &&
            leftDelHapticDone.value === 0
          ) {
            leftDelHapticDone.value = 1
            runOnJS(hapticDelete)()
          }
          if (next <= commitL - 4) {
            leftDelHapticDone.value = 0
          }

          const commitR = commitThreshold(rsw)
          if (
            allowSwipeRemoveMinusSV.value === 1 &&
            next < -commitR &&
            rightDelHapticDone.value === 0
          ) {
            rightDelHapticDone.value = 1
            runOnJS(hapticDelete)()
          }
          if (next >= -commitR + 4) {
            rightDelHapticDone.value = 0
          }
        })
        .onEnd((e) => {
          'worklet'
          gestureNeedsFinalize.value = 0
          // Suppress only after an activated pan (onStart already marked). Avoid
          // blocking taps when the gesture ends without becoming a swipe.
          settle(e.velocityX)
        })
        .onFinalize(() => {
          'worklet'
          if (gestureNeedsFinalize.value === 1) {
            gestureNeedsFinalize.value = 0
            settle(0)
          }
        })
      // SharedValue refs ổn định theo lifetime row; chỉ rebuild gesture khi callback JS đổi identity.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invokeNotifyPanBeginOnJS, markPressSuppressed, runDelete])
    const onLayoutClip = useCallback(
      (ev: LayoutChangeEvent) => {
        const w = ev.nativeEvent.layout.width
        if (w > 0) {
          rowWidth.value = w
          setClipWidth((prev) => (prev === w ? prev : w))
        }
      },
      [rowWidth],
    )

    const wrapAction = useCallback(
      (fn: () => void) => {
        fn()
        close()
      },
      [close],
    )

    const contentStyle = useMemo(
      () => [styles.content, clipWidth > 0 ? { width: clipWidth } : styles.contentFill],
      [clipWidth, styles.content, styles.contentFill],
    )

    const measured = clipWidth > 0
    const { hasElevation, shadowLayerStyle, cardAnimatedStyle } = useCardShell(
      elevation,
      translateX,
    )

    return (
      <Animated.View
        entering={SWIPEABLE_ITEM_ROW_ENTERING}
        exiting={SWIPEABLE_ITEM_ROW_EXITING}
        collapsable={false}
      >
        {measured && hasElevation ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.cardShell, { width: clipWidth }, shadowLayerStyle, cardAnimatedStyle]}
          />
        ) : null}
        <SwipeableRowPressProvider value={rowPressValue}>
          <View style={styles.clip} testID={testID} collapsable={false} onLayout={onLayoutClip}>
            <GestureDetector gesture={pan}>
              <Animated.View style={[styles.row, rowStyle]} collapsable={false}>
                {measured ? (
                  <SwipeableActionStrip
                    actions={leftActions}
                    side="left"
                    rowKey={rowKey}
                    stripPx={leftStripPx}
                    stripStyle={[styles.strip, styles.stripLeft]}
                    translateX={translateX}
                    wrapAction={wrapAction}
                  />
                ) : null}
                <View
                  style={contentStyle}
                  collapsable={false}
                  {...(isWeb ? { onClickCapture: onContentClickCapture } : null)}
                >
                  {children}
                </View>
                {measured ? (
                  <SwipeableActionStrip
                    actions={rightActions}
                    side="right"
                    rowKey={rowKey}
                    stripPx={rightStripPx}
                    stripStyle={[styles.strip, styles.stripRight]}
                    translateX={translateX}
                    wrapAction={wrapAction}
                  />
                ) : null}
              </Animated.View>
            </GestureDetector>
          </View>
        </SwipeableRowPressProvider>
        {measured ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.cardShell,
              { width: clipWidth, borderRadius: CARD_SHELL_RADIUS },
              cardStyle,
              cardAnimatedStyle,
            ]}
          />
        ) : null}
      </Animated.View>
    )
  },
)

SwipeableItem.displayName = 'SwipeableItem'
