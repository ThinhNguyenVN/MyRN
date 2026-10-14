import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { MessageAction, ResultMessage } from '@thinhnguyenvn/chat-core'

import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { RESULT_ROWS_NARROW, RESULT_ROWS_WIDE } from './constants'

import MyChatActionRow from './my-chat-action-row'
import MyChatSummaryList from './my-chat-summary-list'
import { generateStyles } from './styles'

export interface MyChatResultMessageProps {
  message: ResultMessage
  onAction: (action: MessageAction) => void
}

function MyChatResultMessage({ message, onAction }: MyChatResultMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const { isMobileSize } = useTheme()
  const { t } = useTranslation()
  const summary = message.summary ?? []
  const limit = isMobileSize ? RESULT_ROWS_NARROW : RESULT_ROWS_WIDE
  const shown = summary.slice(0, limit)

  return (
    <MySurface radius="large" style={styles.interactiveCard}>
      <MyText typography="label">{message.title}</MyText>

      <ConditionRenderer when={shown.length > 0}>
        <MyChatSummaryList keyPrefix="chat-result-field" summary={shown} />
      </ConditionRenderer>

      <ConditionRenderer when={shown.length < summary.length}>
        <MyText typography="caption" color="text/active/secondary">
          {t('components.chat.rowsShown', { shown: shown.length, total: summary.length })}
        </MyText>
      </ConditionRenderer>

      <ConditionRenderer when={Boolean(message.actions?.length)}>
        <MyChatActionRow actions={message.actions ?? []} onAction={onAction} />
      </ConditionRenderer>
    </MySurface>
  )
}

export default memo(MyChatResultMessage)
