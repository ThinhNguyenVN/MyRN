import { Dimensions, Platform } from 'react-native'

export const BREAKPOINT_DESKTOP = 768

/** Min width to show playground sidebar (tablet / iPad and up). */
export const BREAKPOINT_SIDEBAR = 600

export const isMobileSize = Dimensions.get('window').width < BREAKPOINT_DESKTOP

export const NAVIGATION_BAR_HEIGHT = 70
export const TAB_BAR_HEIGHT = 50

export const MAX_INPUT_WIDTH = 400

export const isIOS = Platform.OS === 'ios'
export const isAndroid = Platform.OS === 'android'
export const isWeb = Platform.OS === 'web'
