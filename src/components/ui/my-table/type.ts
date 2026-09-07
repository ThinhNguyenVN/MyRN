import type { ReactElement } from 'react'

export type MyTableColumnAlign = 'left' | 'right' | 'center'

export type MyTableColumn<Item, Columns> = {
  key: string
  /** Proportional width (RN `flex`) — ignored when `width` (fixed) is set. Default `1`. */
  flex?: number
  /** Absolute floor width in px, paired with `flex`. */
  minWidth?: number
  /** Fixed pixel width — column does not grow/shrink. Wins over `flex`/`minWidth` when set. */
  width?: number
  /** Content alignment inside the column (both header and cell) — default `'left'`. */
  align?: MyTableColumnAlign
  /** Extra breathing room (px) after this column — use when a right-aligned column sits
   *  directly before a left-aligned one, so the two don't crowd the shared row gap. */
  gapAfter?: number
  /** Column hides when this returns true for the current `resolveColumns` result. */
  hideWhen?: (columns: Columns) => boolean
  /** MUST return a single element (`MyText`/`MyView`/`MyPressable`, not a Fragment/string) —
   *  `MyTable` clones it to inject the column's width/align/gap, so header and cell can never
   *  drift out of sync with each other. Content/color/typography stay fully feature-owned. */
  renderHeader: () => ReactElement
  renderCell: (item: Item) => ReactElement
}

export type MyTableProps<Item, Columns> = {
  data: Item[]
  keyExtractor: (item: Item) => string
  /** Pure per-feature function, e.g. `outboundTableColumnVisibility` — MUST apply hysteresis
   *  internally (`resolveHysteresisVisible`) for every column that can hide. */
  resolveColumns: (width: number, previous: Columns | undefined) => Columns
  fallbackWidth: number
  columns: MyTableColumn<Item, Columns>[]
  page: number
  pageSize: number
  total: number
  onPrevPage: () => void
  onNextPage: () => void
  onPageChange: (page: number) => void
}
