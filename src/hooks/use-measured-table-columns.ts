import { useCallback, useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'

/**
 * Đo width thực tế của 1 bảng web (qua `onLayout`) và tính lại bộ cột nên ẩn/hiện mỗi lần đo —
 * `resolve` PHẢI áp dụng hysteresis (ngưỡng ẩn khác ngưỡng hiện, xem `resolveHysteresisVisible`),
 * nếu không width đo được có thể tự dao động quanh 1 ngưỡng (ẩn cột → bảng hẹp lại → scrollbar biến
 * mất → width đo được đổi → hiện cột lại → lặp lại) gây giựt UI liên tục ở đúng 1 khoảng width hẹp
 * (bug thật đã gặp ở outbound/inbound). `resolve` là hàm module-level thuần (`outboundTableColumnVisibility`,
 * `inboundTableColumnVisibility`, ...) nên không cần bọc `useCallback` ở nơi gọi.
 */
export function useMeasuredTableColumns<T>(
  resolve: (width: number, previous: T | undefined) => T,
  fallbackWidth: number,
) {
  const [columns, setColumns] = useState<T>(() => resolve(fallbackWidth, undefined))

  const onTableLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width
      setColumns((previous) => resolve(width, previous))
    },
    [resolve],
  )

  return { columns, onTableLayout }
}
