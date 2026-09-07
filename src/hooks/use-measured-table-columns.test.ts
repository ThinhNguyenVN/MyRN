import { act, renderHook } from '@testing-library/react-native'

import { useMeasuredTableColumns } from './use-measured-table-columns'

type Cols = { showX: boolean }

function resolve(width: number, previous: Cols | undefined): Cols {
  // Hysteresis đơn giản: ẩn dưới 1000, chỉ hiện lại khi >= 1024 (margin 24) — giống thật
  // `resolveHysteresisVisible`, viết tay ở đây để test tách biệt khỏi implementation đó.
  const wasVisible = previous?.showX
  const showX = wasVisible === false ? width >= 1024 : width >= 1000
  if (previous && previous.showX === showX) {
    return previous
  }
  return { showX }
}

function layoutEvent(width: number) {
  return { nativeEvent: { layout: { x: 0, y: 0, width, height: 0 } } } as never
}

describe('useMeasuredTableColumns', () => {
  it('khởi tạo columns từ fallbackWidth (trước khi có lần đo onLayout nào)', () => {
    const { result } = renderHook(() => useMeasuredTableColumns(resolve, 1200))
    expect(result.current.columns).toEqual({ showX: true })
  })

  it('onTableLayout cập nhật columns theo width đo được', () => {
    const { result } = renderHook(() => useMeasuredTableColumns(resolve, 1200))

    act(() => result.current.onTableLayout(layoutEvent(900)))
    expect(result.current.columns).toEqual({ showX: false })
  })

  it('dao động nhỏ quanh ngưỡng sau khi đã ẩn không bật cột trở lại (chặn giựt UI)', () => {
    const { result } = renderHook(() => useMeasuredTableColumns(resolve, 1200))

    act(() => result.current.onTableLayout(layoutEvent(995)))
    expect(result.current.columns).toEqual({ showX: false })

    act(() => result.current.onTableLayout(layoutEvent(1010)))
    expect(result.current.columns).toEqual({ showX: false })

    act(() => result.current.onTableLayout(layoutEvent(995)))
    expect(result.current.columns).toEqual({ showX: false })

    act(() => result.current.onTableLayout(layoutEvent(1024)))
    expect(result.current.columns).toEqual({ showX: true })
  })
})
