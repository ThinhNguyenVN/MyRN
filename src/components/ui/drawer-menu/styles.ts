import { StyleSheet } from 'react-native'

import type { ThemeType } from '@/theme/theme-context'

export const DRAWER_MENU_DEFAULT_WIDTH = 300

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, getRadius, insets } = theme
  const panelBase = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    maxWidth: '86%' as const,
    backgroundColor: getColor('fill/background/tertiary'),
    paddingTop: Math.max(insets.top ?? 0, getSpacing('x4')),
    paddingBottom: Math.max(insets.bottom ?? 0, getSpacing('x4')),
    paddingHorizontal: getSpacing('x4'),
    zIndex: 41,
  }
  return StyleSheet.create({
    // theme-exempt: modal backdrop scrim stays the same dark tint in both themes.
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(25, 28, 30, 0.45)',
      zIndex: 40,
    },
    panelLeft: {
      ...panelBase,
      left: 0,
      borderTopRightRadius: getRadius('large'),
      borderBottomRightRadius: getRadius('large'),
    },
    panelRight: {
      ...panelBase,
      right: 0,
      borderTopLeftRadius: getRadius('large'),
      borderBottomLeftRadius: getRadius('large'),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: getSpacing('x4'),
    },
    userBlock: {
      gap: getSpacing('x1'),
      marginBottom: getSpacing('x5'),
      paddingBottom: getSpacing('x4'),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: getColor('border/inactive/secondary'),
    },
    userName: {
      color: getColor('text/active/primary'),
    },
    userMeta: {
      color: getColor('text/active/secondary'),
    },
    items: {
      gap: getSpacing('x1'),
      flex: 1,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: getSpacing('x3'),
      minHeight: 48,
      paddingHorizontal: getSpacing('x2'),
      borderRadius: getRadius('medium'),
    },
    itemLabel: {
      flex: 1,
      color: getColor('text/active/primary'),
    },
    footer: {
      marginTop: getSpacing('x4'),
    },
  })
}
