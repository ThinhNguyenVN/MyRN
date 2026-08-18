import { Dimensions, Platform } from 'react-native'

export const BREAKPOINT_DESKTOP = 768

/** Min width to show playground sidebar (tablet / iPad and up). */
export const BREAKPOINT_SIDEBAR = 600

/** Web product sidebar auto-collapses below this width (still ≥ desktop). */
export const BREAKPOINT_SIDEBAR_COMPACT = 1200

export const isMobileSize = Dimensions.get('window').width < BREAKPOINT_DESKTOP

export const NAVIGATION_BAR_HEIGHT = 70
/** Tab bar content height (icon + label + active pill), excluding home indicator. */
export const TAB_BAR_HEIGHT = 70

/** `paddingBottom` for tab bar: safe-area when present, else theme `x4` (16). */
export function getTabBarBottomPad(safeBottomInset: number, fallback = 16): number {
  return safeBottomInset > 0 ? fallback + 6 : fallback
}

export function getPrivateTabBarHeight(safeBottomInset: number, fallback = 16): number {
  return TAB_BAR_HEIGHT + getTabBarBottomPad(safeBottomInset, fallback)
}

export const MAX_INPUT_WIDTH = 448
export const MODAL_MAX_WIDTH = 480

export const isIos = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'
export const isWeb = Platform.OS === 'web'
