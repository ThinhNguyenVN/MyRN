import type { ThemeType } from '@/theme/theme-context'
import { StyleSheet } from 'react-native'

export const SIDEBAR_WIDTH = 260
export const SIDEBAR_FLUSH_WIDTH = 280
export const SIDEBAR_COLLAPSED_WIDTH = 72
export const SIDEBAR_PADDING = 12
/** Active pill horizontal inset — expanded uses theme x4 (16px). */
export const SIDEBAR_HIGHLIGHT_INSET_EXPANDED = 16
/** Space between pill edge and icon/label when expanded (theme x4). */
export const SIDEBAR_ITEM_INNER_PADDING_EXPANDED = 16
/** Collapsed pill width (icon 22px + inner breathing room). Inset is derived to center it. */
export const SIDEBAR_COLLAPSED_ACTIVE_PILL_WIDTH = 40
export const SIDEBAR_ITEM_PADDING_EXPANDED =
  SIDEBAR_HIGHLIGHT_INSET_EXPANDED + SIDEBAR_ITEM_INNER_PADDING_EXPANDED
export const SIDEBAR_LIST_WIDTH_EXPANDED = SIDEBAR_FLUSH_WIDTH - SIDEBAR_PADDING * 2
export const SIDEBAR_LIST_WIDTH_COLLAPSED = SIDEBAR_COLLAPSED_WIDTH - SIDEBAR_PADDING * 2
export const SIDEBAR_HIGHLIGHT_INSET_COLLAPSED =
  (SIDEBAR_LIST_WIDTH_COLLAPSED - SIDEBAR_COLLAPSED_ACTIVE_PILL_WIDTH) / 2
export const SIDEBAR_HIGHLIGHT_WIDTH_EXPANDED =
  SIDEBAR_LIST_WIDTH_EXPANDED - SIDEBAR_HIGHLIGHT_INSET_EXPANDED * 2
export const SIDEBAR_ITEM_PADDING_COLLAPSED = (SIDEBAR_LIST_WIDTH_COLLAPSED - 22) / 2
export const ITEM_ROW_HEIGHT = 44
export const ANIMATION_DURATION = 350
export const HIGHLIGHT_ANIMATION_DURATION = Math.round(ANIMATION_DURATION * 1.25)

export function generateStyles(theme: ThemeType) {
  const { getColor, getSpacing, insets, getRadius } = theme
  return StyleSheet.create({
    sidebarOuter: {
      zIndex: 2,
    },
    sidebarOuterFlush: {
      position: 'relative',
      zIndex: 2,
      height: '100%',
      overflow: 'visible',
    },
    sidebarRailAnimated: {
      height: '100%',
      overflow: 'hidden',
    },

    sidebar: {
      flex: 1,
      margin: getSpacing('x2'),
      width: SIDEBAR_WIDTH,
      backgroundColor: getColor('fill/background/primary'),
      paddingTop: insets.top || getSpacing('x4'),
      paddingVertical: getSpacing('x4'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: getColor('border/inactive/secondary'),
    },
    sidebarFlush: {
      flex: 1,
      width: '100%',
      backgroundColor: getColor('fill/background/tertiary'),
      paddingTop: Math.max(insets.top ?? 0, getSpacing('x4')),
      paddingBottom: Math.max(insets.bottom ?? 0, getSpacing('x4')),
      paddingHorizontal: SIDEBAR_PADDING,
      borderWidth: 0,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: getColor('border/inactive/secondary'),
      borderRadius: 0,
    },

    header: {
      marginBottom: getSpacing('x4'),
    },
    footer: {
      marginTop: getSpacing('x3'),
      paddingTop: getSpacing('x3'),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: getColor('border/inactive/secondary'),
      gap: getSpacing('x1'),
    },

    /** Wraps `listContent` so items scroll instead of clipping past the rail's height. */
    listScrollView: {
      flex: 1,
    },
    listContent: {
      paddingVertical: getSpacing('x1'),
    },

    sectionLabel: {
      paddingHorizontal: getSpacing('x3'),
      color: getColor('text/inactive/primary'),
      overflow: 'hidden',
    },

    sectionLayer: {
      zIndex: 0,
    },

    itemLayer: {
      position: 'relative',
      zIndex: 2,
    },

    itemRow: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      height: ITEM_ROW_HEIGHT,
      minHeight: ITEM_ROW_HEIGHT,
      width: '100%',
      gap: getSpacing('x3'),
      overflow: 'hidden',
    },
    itemRowLabelWrap: {
      position: 'absolute',
      left: 34,
      right: 0,
      height: ITEM_ROW_HEIGHT,
      justifyContent: 'center',
      overflow: 'hidden',
    },
    itemRowLabelWrapWithChevron: {
      right: 28,
    },
    itemRowLabel: {
      flexShrink: 0,
    },
    itemRowLeading: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemRowIcon: {
      flexShrink: 0,
      marginLeft: getSpacing('x2'),
    },

    iconLayer: {
      position: 'absolute',
      left: 0,
      top: 0,
    },
    highlight: {
      position: 'absolute',
      top: 0,
      borderRadius: getRadius('medium'),
      zIndex: 1,
      height: ITEM_ROW_HEIGHT,
      minHeight: ITEM_ROW_HEIGHT,
      backgroundColor: getColor('fill/active/primary'),
    },
  })
}
