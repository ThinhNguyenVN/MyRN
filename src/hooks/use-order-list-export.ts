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
  filteredIds: Set<string>
  i18nPrefix: string
  pdfMaxOrders: number
  fetchOrders: (rowId?: string) => Promise<TOrder[]>
  filterOrders: (orders: TOrder[], allowedIds: Set<string>) => TOrder[]
  isPdfOverCap: (orderCount: number) => boolean
  isPopupBlocked: (error: unknown) => boolean
  downloadExcel: (orders: TOrder[]) => Promise<void>
  printPdf: (orders: TOrder[]) => Promise<void>
}

export function useOrderListExport<TItem extends { id: string }, TOrder extends { id: string }>({
  filteredIds,
  i18nPrefix,
  pdfMaxOrders,
  fetchOrders,
  filterOrders,
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
      const allowedIds = rowId ? new Set([rowId]) : filteredIds
      if (allowedIds.size === 0) {
        Toast.show({ text: t(`${i18nPrefix}.empty`), type: 'info' })
        return
      }
      if (kind === 'pdf' && isPdfOverCap(allowedIds.size)) {
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
        const kept = filterOrders(orders, allowedIds)
        if (kept.length === 0) {
          Toast.show({ text: t(`${i18nPrefix}.empty`), type: 'info' })
          return
        }
        if (kind === 'excel') {
          await downloadExcel(kept)
          return
        }
        await printPdf(kept)
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
      filterOrders,
      filteredIds,
      i18nPrefix,
      isExporting,
      isPdfOverCap,
      isPopupBlocked,
      pdfMaxOrders,
      printPdf,
      t,
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
