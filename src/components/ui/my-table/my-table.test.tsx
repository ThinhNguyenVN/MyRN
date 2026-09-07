import { fireEvent, screen } from '@testing-library/react-native'
import { StyleSheet, Text, View } from 'react-native'

import { renderWithTheme } from '@/test/render-with-theme'

import { MyTable } from './my-table'
import type { MyTableColumn } from './type'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'pagination.summary' && opts) {
        return `Hiển thị ${opts.from} đến ${opts.to} trong tổng số ${opts.total}`
      }
      return key
    },
  }),
}))

type Item = { id: string; name: string; extra: string }
type Columns = { showExtra: boolean }

function resolveColumns(width: number, previous: Columns | undefined): Columns {
  const wasVisible = previous?.showExtra
  const showExtra = wasVisible === false ? width >= 1024 : width >= 1000
  if (previous && previous.showExtra === showExtra) {
    return previous
  }
  return { showExtra }
}

const columns: MyTableColumn<Item, Columns>[] = [
  {
    key: 'name',
    flex: 1,
    minWidth: 80,
    renderHeader: () => <Text>Name</Text>,
    renderCell: (item) => <Text>{item.name}</Text>,
  },
  {
    key: 'extra',
    width: 120,
    align: 'right',
    hideWhen: (cols) => !cols.showExtra,
    renderHeader: () => <Text>Extra</Text>,
    renderCell: (item) => <Text testID={`extra-${item.id}`}>{item.extra}</Text>,
  },
]

function layoutEvent(width: number) {
  return { nativeEvent: { layout: { x: 0, y: 0, width, height: 0 } } }
}

const data: Item[] = [
  { id: '1', name: 'Alpha', extra: 'extra-1' },
  { id: '2', name: 'Beta', extra: 'extra-2' },
]

function renderTable(fallbackWidth = 1200) {
  return renderWithTheme(
    <MyTable<Item, Columns>
      data={data}
      keyExtractor={(item) => item.id}
      resolveColumns={resolveColumns}
      fallbackWidth={fallbackWidth}
      columns={columns}
      page={1}
      pageSize={10}
      total={data.length}
      onPrevPage={jest.fn()}
      onNextPage={jest.fn()}
      onPageChange={jest.fn()}
    />,
  )
}

describe('MyTable', () => {
  it('render đúng header + 1 row cho mỗi item, dùng columns từ fallbackWidth', () => {
    renderTable()

    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Extra')).toBeTruthy()
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
    expect(screen.getByTestId('extra-1')).toBeTruthy()
    expect(screen.getByTestId('extra-2')).toBeTruthy()
  })

  it('ẩn cột qua hideWhen + hysteresis — dao động nhỏ quanh ngưỡng không đổi trạng thái', () => {
    renderTable()
    const probe = screen
      .UNSAFE_getAllByType(View)
      .find((node) => typeof node.props.onLayout === 'function')
    if (!probe) {
      throw new Error('table width probe view (onLayout) not found')
    }

    fireEvent(probe, 'layout', layoutEvent(995))
    expect(screen.queryByText('Extra')).toBeNull()

    fireEvent(probe, 'layout', layoutEvent(1010))
    expect(screen.queryByText('Extra')).toBeNull()

    fireEvent(probe, 'layout', layoutEvent(1024))
    expect(screen.getByText('Extra')).toBeTruthy()
  })

  it('forward đúng props pagination xuống Pagination', () => {
    renderTable()

    expect(screen.getByText('Hiển thị 1 đến 2 trong tổng số 2')).toBeTruthy()
  })

  it('áp dụng CÙNG 1 layout style (flex/minWidth) cho header và cell của 1 cột', () => {
    renderTable()

    const headerStyle = StyleSheet.flatten(screen.getByText('Name').props.style)
    const cellStyle = StyleSheet.flatten(screen.getByText('Alpha').props.style)

    expect(headerStyle.flex).toBe(1)
    expect(headerStyle.minWidth).toBe(80)
    expect(cellStyle.flex).toBe(1)
    expect(cellStyle.minWidth).toBe(80)
  })

  it('align: right áp dụng nhất quán textAlign + alignItems cho cả header và cell', () => {
    renderTable()

    const headerStyle = StyleSheet.flatten(screen.getByText('Extra').props.style)
    const cellStyle = StyleSheet.flatten(screen.getByTestId('extra-1').props.style)

    expect(headerStyle.textAlign).toBe('right')
    expect(headerStyle.alignItems).toBe('flex-end')
    expect(cellStyle.textAlign).toBe('right')
    expect(cellStyle.alignItems).toBe('flex-end')
  })
})
