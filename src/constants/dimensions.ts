import { Dimensions } from 'react-native'

export const BREAKPOINT_DESKTOP = 768

/** Min width to show playground sidebar (tablet / iPad and up). */
export const BREAKPOINT_SIDEBAR = 600

export const isMobileSize = Dimensions.get('window').width < BREAKPOINT_DESKTOP

export const NAVIGATION_BAR_HEIGHT = 70

export const MAX_INPUT_WIDTH = 500
