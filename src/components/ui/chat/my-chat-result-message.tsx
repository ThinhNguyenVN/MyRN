import React, { memo } from 'react'

import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import MyChatActionRow from './my-chat-action-row'
import { generateStyles } from './styles'
import type { MessageAction, ResultMessage } from './types'

export interface MyChatResultMessageProps {
  message: ResultMessage
  onAction: (action: MessageAction) => void
}

function MyChatResultMessage({ message, onAction }: MyChatResultMessageProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <MySurface radius="large" style={styles.interactiveCard}>
      <MyText typography="label">{message.title}</MyText>

      <ConditionRenderer when={Boolean(message.summary?.length)}>
        <MyView style={styles.summaryList}>
          {message.summary?.map((field) => (
            <MyView key={`chat-result-field-${field.label}`} style={styles.summaryRow}>
              <MyText typography="caption" color="text/active/secondary">
                {field.label}
              </MyText>
              <MyText typography="label">{field.value}</MyText>
            </MyView>
          ))}
        </MyView>
      </ConditionRenderer>

      <ConditionRenderer when={Boolean(message.actions?.length)}>
        <MyChatActionRow actions={message.actions ?? []} onAction={onAction} />
      </ConditionRenderer>
    </MySurface>
  )
}

export default memo(MyChatResultMessage)
