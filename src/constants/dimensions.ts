import { Dimensions } from 'react-native'

export const BREAKPOINT_DESKTOP = 768

export const isMobileSize = Dimensions.get('window').width < BREAKPOINT_DESKTOP
