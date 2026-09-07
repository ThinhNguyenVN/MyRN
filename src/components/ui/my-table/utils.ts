import { cloneElement, type ReactElement } from 'react'

import type { MyTableColumn } from './type'

/** Style keys `MyTable` computes for a column — a plain object (not `ViewStyle & TextStyle`,
 *  whose `userSelect` types conflict) since it's applied to whichever element type
 *  `renderHeader`/`renderCell` returns (`MyText`, `MyView`, `MyPressable`, ...). */
export type MyTableColumnLayoutStyle = {
  flex?: number
  minWidth?: number
  width?: number
  flexGrow?: number
  flexShrink?: number
  alignItems?: 'flex-start' | 'center' | 'flex-end'
  textAlign?: 'left' | 'center' | 'right'
  paddingRight?: number
}

/**
 * The single source of truth for a column's width/alignment/spacing — computed once here and
 * applied identically to both the header cell and every row cell for that column, so the two
 * can never drift out of sync (the recurring bug this replaces: hand-copied `colXxx` style
 * objects between a feature's web-list header JSX and its table-row JSX).
 */
export function resolveColumnLayoutStyle<Item, Columns>(
  column: MyTableColumn<Item, Columns>,
): MyTableColumnLayoutStyle {
  const layout: MyTableColumnLayoutStyle =
    column.width !== undefined
      ? { width: column.width, flexGrow: 0, flexShrink: 0 }
      : { flex: column.flex ?? 1, minWidth: column.minWidth ?? 0, flexShrink: 1 }

  const alignStyle: MyTableColumnLayoutStyle | null =
    column.align === 'right'
      ? { alignItems: 'flex-end', textAlign: 'right' }
      : column.align === 'center'
        ? { alignItems: 'center', textAlign: 'center' }
        : null

  return {
    ...layout,
    ...alignStyle,
    ...(column.gapAfter ? { paddingRight: column.gapAfter } : null),
  }
}

/** Clones `element` (a `MyText`/`MyView`/`MyPressable`, returned by `renderHeader`/`renderCell`)
 *  and appends the column's layout style — feature-supplied style (color, typography, internal
 *  `flexDirection` for a compound cell) is preserved; only overlapping layout keys are won by
 *  `MyTable` so a feature can't accidentally break alignment again. */
export function renderColumnElement<Item, Columns>(
  column: MyTableColumn<Item, Columns>,
  element: ReactElement,
  key: string,
  extraStyle?: Record<string, unknown>,
): ReactElement {
  const layoutStyle = resolveColumnLayoutStyle(column)
  const existingStyle = (element.props as { style?: unknown }).style
  return cloneElement(element, {
    key,
    style: [extraStyle, existingStyle, layoutStyle],
  } as Record<string, unknown>)
}
