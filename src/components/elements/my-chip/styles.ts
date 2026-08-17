import type { ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'

import { Radius } from '@/theme/radius'
import type { ThemeType } from '@/theme/theme-context'

export const CHIP_SMALL_HEIGHT = 32
export const CHIP_MEDIUM_HEIGHT = 40

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing } = theme

  const base: ViewStyle = {
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getSpacing('x2'),
  }
  const withBorder: ViewStyle = { borderWidth: 1 }

  return StyleSheet.create({
    base,
    primary: {
      ...base,
      backgroundColor: getColor('fill/active/primary'),
      borderWidth: 0,
    },
    primarySelected: {
      ...base,
      ...withBorder,
      backgroundColor: getColor('fill/background/secondary'),
      borderColor: getColor('fill/active/primary'),
    },
    secondary: {
      ...base,
      ...withBorder,
      backgroundColor: 'transparent',
      borderColor: getColor('fill/active/primary'),
    },
    secondarySelected: {
      ...base,
      backgroundColor: getColor('fill/active/primary'),
      borderWidth: 0,
    },
    outlined: {
      ...base,
      ...withBorder,
      backgroundColor: 'transparent',
      borderColor: getColor('border/inactive/primary'),
    },
    outlinedSelected: {
      ...base,
      ...withBorder,
      backgroundColor: getColor('fill/background/secondary'),
      borderColor: getColor('fill/active/primary'),
    },
    filled: {
      ...base,
      backgroundColor: getColor('fill/inactive/primary'),
      borderWidth: 0,
    },
    filledSelected: {
      ...base,
      backgroundColor: getColor('fill/active/primary'),
      borderWidth: 0,
    },
    toneNeutral: {
      ...base,
      ...withBorder,
      backgroundColor: getColor('fill/background/secondary'),
      borderColor: getColor('border/inactive/tertiary'),
    },
    toneSuccess: {
      ...base,
      ...withBorder,
      backgroundColor: getColor('border/success/secondary'),
      borderColor: getColor('border/success/primary'),
    },
    toneAlert: {
      ...base,
      ...withBorder,
      backgroundColor: getColor('border/alert/secondary'),
      borderColor: getColor('border/alert/primary'),
    },
    toneWarning: {
      ...base,
      ...withBorder,
      backgroundColor: getColor('border/warning/secondary'),
      borderColor: getColor('border/warning/primary'),
    },
    toneInfo: {
      ...base,
      ...withBorder,
      backgroundColor: getColor('border/info/secondary'),
      borderColor: getColor('border/info/primary'),
    },
    sizeXs: {
      minHeight: 18,
      paddingHorizontal: getSpacing('x1'),
      paddingVertical: 1,
      gap: 0,
    },
    sizeTag: {
      minHeight: 22,
      paddingHorizontal: getSpacing('x2'),
      paddingVertical: 2,
      gap: getSpacing('x1'),
    },
    sizeSmall: {
      height: CHIP_SMALL_HEIGHT,
      paddingHorizontal: getSpacing('x3'),
    },
    sizeMedium: {
      height: CHIP_MEDIUM_HEIGHT,
      paddingHorizontal: getSpacing('x4'),
    },
    disabled: {
      opacity: 0.5,
    },
    closeTouchable: {
      padding: getSpacing('x1'),
      marginRight: -getSpacing('x1'),
      marginLeft: getSpacing('x1'),
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: getSpacing('x2'),
    },
    addInputWrap: {
      minWidth: 80,
      justifyContent: 'center',
    },
    addInput: {
      minWidth: 80,
      paddingHorizontal: getSpacing('x4'),
      borderRadius: Radius.full,
      borderWidth: 1,
      borderColor: getColor('border/inactive/primary'),
      backgroundColor: getColor('brand/white'),
    },
    addButtonIconOnly: {
      minWidth: CHIP_MEDIUM_HEIGHT,
      paddingHorizontal: 0,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    addButtonIconOnlySmall: {
      minWidth: CHIP_SMALL_HEIGHT,
      paddingHorizontal: 0,
    },
  })
}
