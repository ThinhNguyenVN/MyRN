import type { ReactNode } from 'react'

export type FormFooterAmountBarLayout = 'stacked' | 'compact'

export type FormFooterAmountBarProps = {
  totalLabel: string
  totalText: string
  layout: FormFooterAmountBarLayout
  /** Next to the total (e.g. approve-on-create switch). */
  leading?: ReactNode
}
