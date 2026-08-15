export type ExpandableSearchProps = {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  /** Max expanded width in px. Defaults to ~window width minus chrome. */
  expandedWidth?: number
  searchAccessibilityLabel?: string
  closeAccessibilityLabel?: string
  autoFocus?: boolean
}
