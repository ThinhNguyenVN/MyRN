import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { MessageAction, ResultMessage } from '@thinhnguyenvn/chat-core'

import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { RESULT_ROWS_NARROW, RESULT_ROWS_WIDE } from './constants'
import MyChatActionRow from './my-chat-action-row'
import { ResultBlocks, ResultCardHeader, ResultHero } from './my-chat-result-parts'
import { layoutResultCard } from './result-card-layout'
import { generateStyles } from './styles'

export interface MyChatResultMessageProps {
  message: ResultMessage
  onAction: (action: MessageAction) => void
}

function MyChatResultMessage({ message, onAction }: MyChatResultMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const { isMobileSize } = useTheme()
  const { t } = useTranslation()
  const limit = isMobileSize ? RESULT_ROWS_NARROW : RESULT_ROWS_WIDE
  const layout = useMemo(
    () => layoutResultCard(message.summary ?? [], limit),
    [message.summary, limit],
  )

  return (
    <MySurface radius="large" style={[styles.interactiveCard, styles.resultCard]}>
      <ResultCardHeader title={message.title} subtitle={message.subtitle} icon={message.icon} />

      {layout.hero ? <ResultHero field={layout.hero} /> : null}

      <ResultBlocks blocks={layout.blocks} keyPrefix="chat-result" />

      <ConditionRenderer when={layout.shownRows < layout.totalRows}>
        <MyText typography="caption" color="text/active/secondary">
          {t('components.chat.rowsShown', { shown: layout.shownRows, total: layout.totalRows })}
        </MyText>
      </ConditionRenderer>

      <ConditionRenderer when={Boolean(message.actions?.length)}>
        <MyChatActionRow actions={message.actions ?? []} onAction={onAction} variant="link" />
      </ConditionRenderer>
    </MySurface>
  )
}

export default memo(MyChatResultMessage)
