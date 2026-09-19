import { Easing } from 'react-native-reanimated'

/** Composer sizing floor/line-height shared by layout math, hooks, and styles. */
export const MIN_COMPOSER_HEIGHT = 24
export const COMPOSER_ACTIONS_HEIGHT = 40
export const COMPOSER_INPUT_LINE_HEIGHT = 22

/** Assistant thinking indicator — calm staggered pulse (not a “person typing” bounce). */
export const TYPING_DOT_STAGGER_MS = 140
export const TYPING_DOT_HALF_CYCLE_MS = 420
export const TYPING_DOT_EASING = Easing.inOut(Easing.ease)
export const TYPING_DOT_OPACITY_MIN = 0.28
export const TYPING_DOT_OPACITY_MAX = 1
export const TYPING_DOT_SCALE_MIN = 0.82
export const TYPING_DOT_SCALE_MAX = 1

/** Composer expand/collapse resize animation. */
export const COMPOSER_RESIZE_ANIMATION_MS = 180
export const COMPOSER_RESIZE_EASING = Easing.out(Easing.cubic)
export const COLLAPSE_RESIZE_CONFIG = {
  duration: COMPOSER_RESIZE_ANIMATION_MS,
  easing: COMPOSER_RESIZE_EASING,
}

/** Max gap (px) kept between the grown composer and the top of the viewport. */
export const INPUT_MAX_VIEWPORT_GAP = 20

/** Drag-to-collapse gesture thresholds. */
export const COLLAPSE_PULL_THRESHOLD = 56
export const COLLAPSE_PULL_VELOCITY = 900

/**
 * Minimum composer height change (px) worth re-rendering the list for. Keeps the
 * expand/collapse animation from relaying out FlashList on every frame.
 */
export const COMPOSER_HEIGHT_COMMIT_THRESHOLD = 8

/** Distance (px) from the real bottom still considered "at bottom" for keyboard anchoring. */
export const BOTTOM_ANCHOR_THRESHOLD = 24

/** Touch travel (px) under which a gesture still counts as a tap, not a scroll. */
export const TAP_SLOP = 8

/**
 * Extra px nudged past `scrollToEnd()`'s own target on Android keyboard-close.
 * `scrollToEnd` is invoked at the very start of the close transition (so the shift is
 * masked by the transform, per the onStart-consolidation design), but at that moment the
 * `marginBottom: 0` relayout hasn't necessarily finished growing the FlashList's
 * viewport yet, so its computed end can land a few px short of the true bottom padding.
 * This nudge is issued in the same rAF chain, before the keyboard visibly starts moving,
 * so it reads as part of the same settle rather than a second, separate motion.
 */
export const KEYBOARD_CLOSE_SCROLL_SLACK = 8
