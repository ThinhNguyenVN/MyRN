import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Confirmation } from '@/components/ui/confirmation'
import { Toast } from '@/components/ui/toast'

function hidePdfCapConfirmation() {
  Confirmation.hide()
}

export type OrderListExportController<TItem extends { id: string }> = {
  isExporting: boolean
  onBulkPdf: () => void
  onBulkExcel: () => void
  onRowPdf: (item: TItem) => void
  onRowExcel: (item: TItem) => void
}

export type UseOrderListExportParams<TOrder extends { id: string }> = {
  /** Total count matching the current filter/search (from server-side `pagination.total`) — used to
   * check emptiness / the PDF cap BEFORE fetching. No client-side re-filtering by id is needed
   * because `fetchOrders` already receives the current filter and the server returns exactly that
   * set. */
  totalCount: number
  i18nPrefix: string
  pdfMaxOrders: number
  fetchOrders: (rowId?: string) => Promise<TOrder[]>
  isPdfOverCap: (orderCount: number) => boolean
  isPopupBlocked: (error: unknown) => boolean
  downloadExcel: (orders: TOrder[]) => Promise<void>
  printPdf: (orders: TOrder[]) => Promise<void>
}

export function useOrderListExport<TItem extends { id: string }, TOrder extends { id: string }>({
  totalCount,
  i18nPrefix,
  pdfMaxOrders,
  fetchOrders,
  isPdfOverCap,
  isPopupBlocked,
  downloadExcel,
  printPdf,
}: UseOrderListExportParams<TOrder>): OrderListExportController<TItem> {
  const { t } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)

  const runExport = useCallback(
    async (kind: 'pdf' | 'excel', rowId?: string) => {
      if (isExporting) {
        return
      }
      const allowedCount = rowId ? 1 : totalCount
      if (allowedCount === 0) {
        Toast.show({ text: t(`${i18nPrefix}.empty`), type: 'info' })
        return
      }
      if (kind === 'pdf' && isPdfOverCap(allowedCount)) {
        await Confirmation.confirm({
          title: t(`${i18nPrefix}.pdfTooManyTitle`),
          message: t(`${i18nPrefix}.pdfTooMany`, { max: pdfMaxOrders }),
          type: 'warning',
          buttons: [
            {
              text: t(`${i18nPrefix}.pdfTooManyAck`),
              type: 'primary',
              onPress: hidePdfCapConfirmation,
            },
          ],
        })
        return
      }
      setIsExporting(true)
      try {
        const orders = await fetchOrders(rowId)
        if (orders.length === 0) {
          Toast.show({ text: t(`${i18nPrefix}.empty`), type: 'info' })
          return
        }
        if (kind === 'excel') {
          await downloadExcel(orders)
          return
        }
        await printPdf(orders)
      } catch (error) {
        if (isPopupBlocked(error)) {
          Toast.show({ text: t(`${i18nPrefix}.popupBlocked`), type: 'warning' })
          return
        }
        console.error(error)
        Toast.show({
          text: t(`${i18nPrefix}.error`),
          type: 'error',
        })
      } finally {
        setIsExporting(false)
      }
    },
    [
      downloadExcel,
      fetchOrders,
      i18nPrefix,
      isExporting,
      isPdfOverCap,
      isPopupBlocked,
      pdfMaxOrders,
      printPdf,
      t,
      totalCount,
    ],
  )

  const handleBulkPdf = useCallback(() => {
    void runExport('pdf')
  }, [runExport])

  const handleBulkExcel = useCallback(() => {
    void runExport('excel')
  }, [runExport])

  const handleRowPdf = useCallback(
    (item: TItem) => {
      void runExport('pdf', item.id)
    },
    [runExport],
  )

  const handleRowExcel = useCallback(
    (item: TItem) => {
      void runExport('excel', item.id)
    },
    [runExport],
  )

  return useMemo(
    () => ({
      isExporting,
      onBulkPdf: handleBulkPdf,
      onBulkExcel: handleBulkExcel,
      onRowPdf: handleRowPdf,
      onRowExcel: handleRowExcel,
    }),
    [handleBulkExcel, handleBulkPdf, handleRowExcel, handleRowPdf, isExporting],
  )
}
