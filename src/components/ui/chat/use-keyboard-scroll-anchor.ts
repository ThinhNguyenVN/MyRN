import { useCallback, useRef } from 'react'
import { useGenericKeyboardHandler } from 'react-native-keyboard-controller'
import { runOnJS, type SharedValue } from 'react-native-reanimated'

import { isAndroid, isWeb } from '@/constants/dimensions'

/**
 * Keyboard list correction without changing `marginBottom` / composer lift.
 * Close: pin on `onStart` (rides with the slide) and again on `onEnd` if FlashList
 * had not finished contentSize. Open: pin on `onEnd`. Freeze at-bottom while the
 * keyboard is moving — `onScroll` in that window uses a stale viewport.
 */
export function useKeyboardScrollAnchor(
  scrollToEnd: () => void,
  isAtBottomRef: { current: boolean },
  motionLockRef: { current: boolean },
  /**
   * Android only: keyboard space (px) the list layout reserves. Written here, in the
   * same worklet that starts the transition, so the layout commit and the counter-
   * transform derived from it land together (see MyChatList).
   */
  keyboardSpace: SharedValue<number>,
  /** Android only: shifts the scroll by the change in reserved space. */
  shiftScroll: (destinationKeyboardHeight: number) => void,
) {
  const pinThisCloseRef = useRef(false)

  const handleStart = useCallback(
    (isClosing: boolean, destinationHeight: number) => {
      motionLockRef.current = true
      if (isAndroid) {
        // Everything that changes position happens HERE, at the start, masked by the
        // transform — so once the keyboard settles there is nothing left to move. The
        // late pin was the residual slide; per-frame layout was the jank.
        shiftScroll(destinationHeight)
        return
      }
      if (!isClosing || !isAtBottomRef.current) {
        return
      }
      pinThisCloseRef.current = true
      scrollToEnd()
    },
    [isAtBottomRef, motionLockRef, scrollToEnd, shiftScroll],
  )

  const handleEnd = useCallback(
    (isOpen: boolean) => {
      if (isAndroid) {
        motionLockRef.current = false
        return
      }
      if (isOpen) {
        if (isAtBottomRef.current) {
          scrollToEnd()
        }
      } else if (pinThisCloseRef.current) {
        pinThisCloseRef.current = false
        scrollToEnd()
      }
      motionLockRef.current = false
    },
    [isAtBottomRef, motionLockRef, scrollToEnd],
  )

  useGenericKeyboardHandler(
    {
      onStart: (event) => {
        'worklet'
        if (isWeb) {
          return
        }
        if (isAndroid) {
          keyboardSpace.value = event.height
        }
        runOnJS(handleStart)(event.height <= 0, event.height)
      },
      onEnd: (event) => {
        'worklet'
        if (isWeb) {
          return
        }
        runOnJS(handleEnd)(event.height > 0)
      },
    },
    [handleEnd, handleStart],
  )
}
