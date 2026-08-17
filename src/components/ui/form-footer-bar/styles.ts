import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, isMobileSize, insets } = theme
  const pagePadX = getSpacing(isMobileSize ? 'x4' : 'x8')
  return StyleSheet.create({
    shell: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: getColor('border/inactive/quaternary'),
      backgroundColor: getColor('fill/background/tertiary'),
      paddingTop: getSpacing('x4'),
      paddingHorizontal: pagePadX,
      paddingBottom: Math.max(insets.bottom ?? 0, getSpacing('x4')),
      width: '100%',
      zIndex: 2,
    },
    shellWizard: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
    },
    row: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: getSpacing('x3'),
    },
    actions: {
      flexDirection: 'row',
      flexWrap: isMobileSize ? 'nowrap' : 'wrap',
      alignItems: 'center',
      gap: getSpacing('x2'),
      flexGrow: 0,
      flexShrink: 0,
    },
    actionButton: {
      minWidth: isMobileSize ? undefined : 120,
    },
    wizardStack: {
      width: '100%',
      gap: getSpacing('x3'),
    },
    wizardActions: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: getSpacing('x3'),
    },
    wizardButtonGrow: {
      flex: 1,
    },
    sheetBody: {
      gap: getSpacing('x3'),
      width: '100%',
      paddingBottom: getSpacing('x4'),
    },
  })
}
