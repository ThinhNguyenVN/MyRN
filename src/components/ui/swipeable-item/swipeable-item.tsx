import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { LayoutChangeEvent, StyleSheet, useWindowDimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

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
import { SwipeableActionStrip } from './swipeable-action-strip'
import { generateStyles, stripWidthPx } from './styles'
import type { SwipeableItemProps, SwipeableItemRef } from './types'

const hapticDelete = () => {
  triggerHaptic('Medium')
}

export const SwipeableItem = forwardRef<SwipeableItemRef, SwipeableItemProps>(
  function SwipeableItem(
    { rowKey, children, leftActions = [], rightActions = [], onDelete, swipeToRemove, testID },
    ref,
  ) {
    const styles = useThemedStyles(generateStyles)
    const { width: windowWidth } = useWindowDimensions()
    const swipeableItem = useSwipeableItemOptional()

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

    const foregroundStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: translateX.value }],
    }))

    const underlayWrapStyle = useAnimatedStyle(() => ({
      opacity: underlayOpacity.value,
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

        const commitL = lw > 0 ? lw + COMMIT_EXTRA : COMMIT_EXTRA
        const commitR = rsw > 0 ? rsw + COMMIT_EXTRA : COMMIT_EXTRA

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
              if (finished) runOnJS(runDelete)()
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
        .onUpdate((e) => {
          'worklet'
          const rw = rowWidth.value
          const lw = leftStripSV.value
          const rsw = rightStripSV.value
          const preview = Math.max(rw * PREVIEW_FRAC, 96)
          let next = dragStartX.value + e.translationX
          const maxX = lw > 0 ? lw + COMMIT_EXTRA + preview : 0
          const minX = rsw > 0 ? -(rsw + COMMIT_EXTRA + preview) : 0
          if (next > maxX) next = maxX
          if (next < minX) next = minX
          translateX.value = next

          const commitL = lw > 0 ? lw + COMMIT_EXTRA : COMMIT_EXTRA
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

          const commitR = rsw > 0 ? rsw + COMMIT_EXTRA : COMMIT_EXTRA
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
    }, [invokeNotifyPanBeginOnJS, runDelete])

    const onLayoutForeground = useCallback(
      (ev: LayoutChangeEvent) => {
        const w = ev.nativeEvent.layout.width
        if (w > 0) {
          rowWidth.value = w
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

    return (
      <Animated.View
        entering={SWIPEABLE_ITEM_ROW_ENTERING}
        exiting={SWIPEABLE_ITEM_ROW_EXITING}
        collapsable={false}
      >
        <View style={styles.root} testID={testID}>
          <Animated.View
            style={[StyleSheet.absoluteFillObject, styles.underlayClip, underlayWrapStyle]}
            pointerEvents="box-none"
          >
            <View style={styles.underlayBg} pointerEvents="box-none" />
            <SwipeableActionStrip
              actions={leftActions}
              side="left"
              rowKey={rowKey}
              stripPx={leftStripPx}
              stripStyle={styles.leftStripAbs}
              translateX={translateX}
              wrapAction={wrapAction}
            />
            <SwipeableActionStrip
              actions={rightActions}
              side="right"
              rowKey={rowKey}
              stripPx={rightStripPx}
              stripStyle={styles.rightStripAbs}
              translateX={translateX}
              wrapAction={wrapAction}
            />
          </Animated.View>

          <GestureDetector gesture={pan}>
            <Animated.View
              style={[styles.foreground, foregroundStyle]}
              onLayout={onLayoutForeground}
              collapsable={false}
            >
              {children}
            </Animated.View>
          </GestureDetector>
        </View>
      </Animated.View>
    )
  },
)

SwipeableItem.displayName = 'SwipeableItem'
