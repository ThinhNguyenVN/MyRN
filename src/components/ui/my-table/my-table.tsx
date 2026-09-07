import type { ReactElement } from 'react'
import { ScrollView } from 'react-native'

import MySurface from '@/components/elements/my-surface'
import MyView from '@/components/elements/my-view'
import { Pagination } from '@/components/ui/pagination'
import { useMeasuredTableColumns } from '@/hooks/use-measured-table-columns'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MyTableProps } from './type'
import { renderColumnElement } from './utils'

export function MyTable<Item, Columns>({
  data,
  keyExtractor,
  resolveColumns,
  fallbackWidth,
  columns,
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
          contentContainerStyle={styles.tableScrollContent}
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
            {data.map((item) => (
              <MyView key={keyExtractor(item)} style={styles.tableRow}>
                {visibleColumns.map((column) =>
                  renderColumnElement(column, column.renderCell(item), column.key),
                )}
              </MyView>
            ))}
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
