import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import MyPressable from '@/components/elements/my-pressable'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import MyChatTyping from './my-chat-typing'
import type { TextMessage } from './types'

export interface MyChatTextMessageProps {
  message: TextMessage
  onRetry?: (messageId: string) => void
}

function MyChatTextMessage({ message, onRetry }: MyChatTextMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const isUser = message.role === 'user'
  const isTyping = !isUser && message.status === 'pending' && message.text === ''
  const isError = message.status === 'error'

  const handleRetry = useCallback(() => {
    onRetry?.(message.id)
  }, [message.id, onRetry])

  if (isUser) {
    return (
      <MySurface radius="large" style={styles.userBubble}>
        <MyText typography="body" style={styles.userBubbleText}>
          {message.text}
        </MyText>
      </MySurface>
    )
  }

  return (
    <MyView style={styles.assistantContent}>
      <ConditionRenderer when={isTyping}>
        <MyChatTyping />
      </ConditionRenderer>
      <ConditionRenderer when={!isTyping && !isError}>
        <MyText typography="body">{message.text}</MyText>
      </ConditionRenderer>
      <ConditionRenderer when={isError}>
        <MyView style={styles.errorRow}>
          <MyText typography="body" style={styles.errorText}>
            {message.error?.message ?? t('components.chat.errorGeneric')}
          </MyText>
          <MyPressable onPress={handleRetry}>
            <MyText typography="label" style={styles.retryLink}>
              {t('components.chat.retry')}
            </MyText>
          </MyPressable>
        </MyView>
      </ConditionRenderer>
    </MyView>
  )
}

export default memo(MyChatTextMessage)
