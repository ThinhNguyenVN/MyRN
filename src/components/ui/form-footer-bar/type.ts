import type { ReactNode } from 'react'

import type { ButtonType } from '@/components/elements/my-button/type'

export type FormFooterExtraAction = {
  id: string
  label: string
  type: ButtonType
  onPress: () => void
  visible: boolean
}

export type FormFooterBarProps = {
  canSave: boolean
  busy: boolean
  saveLabel: string
  onSave: () => void
  extraActions: FormFooterExtraAction[]
  showAmount: boolean
  totalLabel: string
  totalText: string
  leading?: ReactNode
  moreTitle: string
  moreAccessibilityLabel: string
  backLabel?: string
  showBack?: boolean
  onBack?: () => void
  nextLabel?: string
  onNext?: () => void
  isLastStep?: boolean
}
