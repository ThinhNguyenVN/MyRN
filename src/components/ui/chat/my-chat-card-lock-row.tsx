import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

import MyIcon from '@/components/elements/my-icon'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { CardLockState } from './types'

const LOCK_LABEL_KEYS: Record<CardLockState, string> = {
  expired: 'components.chat.cardExpired',
  cancelled: 'components.chat.cancelled',
  superseded: 'components.chat.cardSuperseded',
}

export interface MyChatCardLockRowProps {
  lockState: CardLockState
}

function MyChatCardLockRow({ lockState }: MyChatCardLockRowProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()

  return (
    <MyView style={styles.resolvedRow}>
      <MyIcon name="close-circle" size={16} color="icon/inactive/primary" />
      <MyText typography="label">{t(LOCK_LABEL_KEYS[lockState])}</MyText>
    </MyView>
  )
}

export default memo(MyChatCardLockRow)
