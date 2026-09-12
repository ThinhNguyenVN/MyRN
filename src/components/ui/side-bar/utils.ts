import { ITEM_ROW_HEIGHT, SECTION_ROW_HEIGHT_EXPANDED, SIDEBAR_LIST_PADDING_Y } from './styles'
import type { SideBarItem } from './type'

/** Pill `translateY` from a fixed row model so collapse/expand cannot remasure to y=0. */
export function computeSidebarHighlightY(
  items: readonly SideBarItem[],
  activeIndex: number,
  collapsed: boolean,
): number {
  if (activeIndex <= 0) {
    return SIDEBAR_LIST_PADDING_Y
  }

  let y = SIDEBAR_LIST_PADDING_Y
  for (let i = 0; i < activeIndex; i += 1) {
    const item = items[i]
    if (item?.kind === 'section') {
      y += collapsed ? 0 : SECTION_ROW_HEIGHT_EXPANDED
      continue
    }
    y += ITEM_ROW_HEIGHT
  }
  return y
}
