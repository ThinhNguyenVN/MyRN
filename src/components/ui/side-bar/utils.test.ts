import { ITEM_ROW_HEIGHT, SECTION_ROW_HEIGHT_EXPANDED, SIDEBAR_LIST_PADDING_Y } from './styles'
import type { SideBarItem } from './type'
import { computeSidebarHighlightY } from './utils'

const items: SideBarItem[] = [
  { label: 'Home', href: '/home' },
  { label: 'Overview', href: '/dashboard' },
  { kind: 'section', label: 'Ops' },
  { label: 'Inbound', href: '/inbound' },
  { kind: 'section', label: 'Settings' },
  { label: 'Data', href: '/settings' },
]

describe('computeSidebarHighlightY', () => {
  it('pins the first row to list padding', () => {
    expect(computeSidebarHighlightY(items, 0, false)).toBe(SIDEBAR_LIST_PADDING_Y)
    expect(computeSidebarHighlightY(items, 0, true)).toBe(SIDEBAR_LIST_PADDING_Y)
    expect(computeSidebarHighlightY(items, -1, false)).toBe(SIDEBAR_LIST_PADDING_Y)
  })

  it('keeps the same y for pinned rows above the first section', () => {
    const overviewY = SIDEBAR_LIST_PADDING_Y + ITEM_ROW_HEIGHT
    expect(computeSidebarHighlightY(items, 1, false)).toBe(overviewY)
    expect(computeSidebarHighlightY(items, 1, true)).toBe(overviewY)
  })

  it('drops section height when collapsed so the pill stays on the same item', () => {
    const inboundExpanded =
      SIDEBAR_LIST_PADDING_Y + ITEM_ROW_HEIGHT * 2 + SECTION_ROW_HEIGHT_EXPANDED
    const inboundCollapsed = SIDEBAR_LIST_PADDING_Y + ITEM_ROW_HEIGHT * 2
    expect(computeSidebarHighlightY(items, 3, false)).toBe(inboundExpanded)
    expect(computeSidebarHighlightY(items, 3, true)).toBe(inboundCollapsed)

    const dataExpanded =
      SIDEBAR_LIST_PADDING_Y + ITEM_ROW_HEIGHT * 3 + SECTION_ROW_HEIGHT_EXPANDED * 2
    const dataCollapsed = SIDEBAR_LIST_PADDING_Y + ITEM_ROW_HEIGHT * 3
    expect(computeSidebarHighlightY(items, 5, false)).toBe(dataExpanded)
    expect(computeSidebarHighlightY(items, 5, true)).toBe(dataCollapsed)
  })
})
