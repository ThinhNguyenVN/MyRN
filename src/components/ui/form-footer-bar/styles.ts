import { StyleSheet } from 'react-native'

import { FORM_PAGE_MAX_WIDTH } from '@/constants/dimensions'
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
    /** Same column as form `pageColumn` / scroll padding so the bar matches the cards above. */
    inner: {
      width: '100%',
      maxWidth: FORM_PAGE_MAX_WIDTH,
      alignSelf: 'center',
      paddingHorizontal: pagePadX,
    },
    row: {
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: getSpacing('x3'),
    },
    actions: {
      flexDirection: 'row',
      flexWrap: isMobileSize ? 'nowrap' : 'wrap',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: getSpacing('x2'),
      flexGrow: 0,
      flexShrink: 0,
      marginLeft: 'auto',
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
