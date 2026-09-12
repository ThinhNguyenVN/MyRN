import type { ReactNode } from 'react'

export type FormFooterAmountBarLayout = 'stacked' | 'compact'

export type FormFooterAmountBarProps = {
  totalLabel: string
  totalText: string
  layout: FormFooterAmountBarLayout
  /** Trailing control on the amount bar (e.g. approve-on-create switch). */
  right?: ReactNode
}
