import { useCallback, type ReactElement, type ReactNode } from 'react'
import { Pressable, ScrollView, type StyleProp, type ViewStyle } from 'react-native'

import MySurface from '@/components/elements/my-surface'
import MyView from '@/components/elements/my-view'
import { Pagination } from '@/components/ui/pagination'
import { useMeasuredTableColumns } from '@/hooks/use-measured-table-columns'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MyTableProps } from './type'
import { renderColumnElement } from './utils'

type TableRowPressableProps<Item> = {
  item: Item
  style: StyleProp<ViewStyle>
  label?: string
  onRowPress: (item: Item) => void
  children: ReactNode
}

/** Pressable row: a plain RN `Pressable` keeps the row's flex layout identical to a non-pressable row. */
function TableRowPressable<Item>({
  item,
  style,
  label,
  onRowPress,
  children,
}: TableRowPressableProps<Item>) {
  const handlePress = useCallback(() => {
    onRowPress(item)
  }, [item, onRowPress])
  return (
    <Pressable
      style={style}
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      {children}
    </Pressable>
  )
}

export function MyTable<Item, Columns>({
  data,
  keyExtractor,
  resolveColumns,
  fallbackWidth,
  columns,
  onRowPress,
  getRowAccessibilityLabel,
  fitWidth = false,
  page,
  pageSize,
  total,
  onPrevPage,
  onNextPage,
  onPageChange,
}: MyTableProps<Item, Columns>): ReactElement {
  const styles = useThemedStyles(generateStyles)
  const { columns: columnVisibility, onTableLayout } = useMeasuredTableColumns(
    resolveColumns,
    fallbackWidth,
  )

  const visibleColumns = columns.filter(
    (column) => !column.hideWhen || !column.hideWhen(columnVisibility),
  )

  return (
    <MyView style={styles.tableWidthProbe} onLayout={onTableLayout}>
      <MySurface elevation="soft/down/small" radius="large" style={styles.panel}>
        <ScrollView
          horizontal
          style={styles.tableScroll}
          contentContainerStyle={[styles.tableScrollContent, fitWidth ? styles.tableFit : null]}
        >
          <MyView style={styles.tableMin}>
            <MyView style={styles.tableHeader}>
              {visibleColumns.map((column) =>
                renderColumnElement(
                  column,
                  column.renderHeader(),
                  column.key,
                  styles.tableHeaderCell,
                ),
              )}
            </MyView>
            {data.map((item) => {
              const cells = visibleColumns.map((column) =>
                renderColumnElement(column, column.renderCell(item), column.key),
              )
              return onRowPress ? (
                <TableRowPressable
                  key={keyExtractor(item)}
                  item={item}
                  style={styles.tableRow}
                  label={getRowAccessibilityLabel?.(item)}
                  onRowPress={onRowPress}
                >
                  {cells}
                </TableRowPressable>
              ) : (
                <MyView key={keyExtractor(item)} style={styles.tableRow}>
                  {cells}
                </MyView>
              )
            })}
          </MyView>
        </ScrollView>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPrev={onPrevPage}
          onNext={onNextPage}
          onPageChange={onPageChange}
        />
      </MySurface>
    </MyView>
  )
}
