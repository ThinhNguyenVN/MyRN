import {
  SIDEBAR_COLLAPSED_ACTIVE_PILL_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_HIGHLIGHT_INSET_COLLAPSED,
  SIDEBAR_HIGHLIGHT_INSET_EXPANDED,
  SIDEBAR_HIGHLIGHT_WIDTH_EXPANDED,
  SIDEBAR_ITEM_INNER_PADDING_EXPANDED,
  SIDEBAR_ITEM_PADDING_EXPANDED,
  SIDEBAR_LIST_WIDTH_COLLAPSED,
  SIDEBAR_PADDING,
} from './styles'

describe('sidebar highlight geometry', () => {
  it('expanded pill keeps x4 horizontal inset (16px each side)', () => {
    expect(SIDEBAR_HIGHLIGHT_INSET_EXPANDED).toBe(16)
    expect(SIDEBAR_HIGHLIGHT_WIDTH_EXPANDED).toBeGreaterThan(180)
  })

  it('expanded row padding includes inner pill breathing room beyond highlight inset', () => {
    expect(SIDEBAR_ITEM_PADDING_EXPANDED).toBe(
      SIDEBAR_HIGHLIGHT_INSET_EXPANDED + SIDEBAR_ITEM_INNER_PADDING_EXPANDED,
    )
    expect(SIDEBAR_ITEM_INNER_PADDING_EXPANDED).toBeGreaterThanOrEqual(12)
  })

  it('collapsed pill is wide enough for icon + breathing room, not a thin sliver', () => {
    expect(SIDEBAR_COLLAPSED_ACTIVE_PILL_WIDTH).toBeGreaterThanOrEqual(40)
    expect(SIDEBAR_HIGHLIGHT_INSET_COLLAPSED).toBeGreaterThanOrEqual(4)
    expect(SIDEBAR_HIGHLIGHT_INSET_COLLAPSED * 2 + SIDEBAR_COLLAPSED_ACTIVE_PILL_WIDTH).toBe(
      SIDEBAR_LIST_WIDTH_COLLAPSED,
    )
  })

  it('collapsed active pill has visible gap from rail border (padding + inset)', () => {
    const gapFromRailEdge = SIDEBAR_PADDING + SIDEBAR_HIGHLIGHT_INSET_COLLAPSED
    expect(gapFromRailEdge).toBeGreaterThanOrEqual(16)
    expect(SIDEBAR_COLLAPSED_WIDTH).toBe(72)
  })
})
