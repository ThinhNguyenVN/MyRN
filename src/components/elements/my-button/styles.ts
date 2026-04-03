import type { ViewStyle } from 'react-native'
import { Radius } from '@/theme/radius'
import { StyleSheet } from 'react-native'
import { ThemeType } from '@/theme/theme-context'

export const BUTTON_SMALL_HEIGHT = 40
export const BUTTON_LARGE_HEIGHT = 48

export const generateStyles = (theme: ThemeType) => {
  const { getColor, getSpacing, getRadius } = theme

  const base: ViewStyle = {
    borderRadius: Radius.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getSpacing('x2'),
    width: '100%',
  }
  const withBorder: ViewStyle = { borderWidth: 1 }
  return StyleSheet.create({
    primary: {
      ...base,
      backgroundColor: getColor('fill/active/primary'),
      borderWidth: 0,
    },
    secondary: {
      ...base,
      ...withBorder,
      backgroundColor: '#FFFFFF',
      borderColor: getColor('fill/active/primary'),
    },
    tertiary: {
      ...base,
      backgroundColor: getColor('fill/alert/primary'),
      borderWidth: 0,
    },
    light: {
      ...base,
      ...withBorder,
      backgroundColor: getColor('fill/background/primary'),
      borderColor: getColor('border/inactive/primary'),
    },
    dark: {
      ...base,
      backgroundColor: '#000000',
      borderWidth: 0,
    },
    sizeSmall: { height: BUTTON_SMALL_HEIGHT, paddingHorizontal: 12 },
    sizeLarge: { height: BUTTON_LARGE_HEIGHT, paddingHorizontal: 24 },
    disabled: {
      backgroundColor: getColor('fill/disabled/primary'),
      borderWidth: 0,
    },
    touchable: {
      flex: 1,
    },
    iconButtonSmall: {
      width: BUTTON_SMALL_HEIGHT,
      height: BUTTON_SMALL_HEIGHT,
      minWidth: BUTTON_SMALL_HEIGHT,
      minHeight: BUTTON_SMALL_HEIGHT,
      borderRadius: getRadius('full'),
      padding: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
      gap: 0,
    },
    iconButtonLarge: {
      width: BUTTON_LARGE_HEIGHT,
      height: BUTTON_LARGE_HEIGHT,
      minWidth: BUTTON_LARGE_HEIGHT,
      minHeight: BUTTON_LARGE_HEIGHT,
      borderRadius: getRadius('full'),
      padding: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
      gap: 0,
    },
  })
}
