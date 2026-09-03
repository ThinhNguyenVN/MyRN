export type ExpandableSearchProps = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  /** Max expanded width in px. Defaults to ~window width minus chrome, capped at
   *  `EXPANDABLE_SEARCH_MAX_WIDTH` so it doesn't stretch edge-to-edge on wide windows. */
  expandedWidth?: number
  searchAccessibilityLabel?: string
  closeAccessibilityLabel?: string
  autoFocus?: boolean
}
