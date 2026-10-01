import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

import MyChatCardLockRow from './my-chat-card-lock-row'
import MyChatSummaryList from './my-chat-summary-list'
import { generateStyles } from './styles'
import type { ConfirmationMessage } from './types'

export interface MyChatConfirmationMessageProps {
  message: ConfirmationMessage
  onConfirm: (messageId: string, confirmed: boolean) => void
}

function MyChatConfirmationMessage({ message, onConfirm }: MyChatConfirmationMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const { getColor } = useTheme()
  const { t } = useTranslation()
  const isLocked = message.lockState !== undefined
  const isResolved = message.resolution !== undefined && !isLocked
  const isPending = message.resolution === undefined && !isLocked

  const handleConfirm = useCallback(() => {
    onConfirm(message.id, true)
  }, [message.id, onConfirm])

  const handleCancel = useCallback(() => {
    onConfirm(message.id, false)
  }, [message.id, onConfirm])

  return (
    <MySurface radius="large" style={styles.interactiveCard}>
      <MyText typography="body">{message.prompt}</MyText>

      <ConditionRenderer when={Boolean(message.summary?.length)}>
        <MyChatSummaryList
          keyPrefix="chat-confirmation-field"
          summary={message.summary ?? []}
          changedFields={message.changedFields}
        />
      </ConditionRenderer>

      <ConditionRenderer when={isPending}>
        <MyView style={styles.confirmationButtonsRow}>
          <MyButton
            text={message.cancelLabel ?? t('components.chat.cancel')}
            type="light"
            width="auto"
            elevation="none"
            onPress={handleCancel}
          />
          <MyButton
            text={message.confirmLabel ?? t('components.chat.confirm')}
            type="primary"
            width="auto"
            elevation="none"
            textColor={message.destructive ? getColor('text/alert/primary') : undefined}
            onPress={handleConfirm}
          />
        </MyView>
      </ConditionRenderer>

      {message.lockState ? <MyChatCardLockRow lockState={message.lockState} /> : null}

      <ConditionRenderer when={isResolved}>
        <MyView style={styles.resolvedRow}>
          <MyIcon
            name={message.resolution === 'confirmed' ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={
              message.resolution === 'confirmed' ? 'icon/success/primary' : 'icon/inactive/primary'
            }
          />
          <MyText typography="label">
            {message.resolution === 'confirmed'
              ? t('components.chat.confirmed')
              : t('components.chat.cancelled')}
          </MyText>
        </MyView>
      </ConditionRenderer>
    </MySurface>
  )
}

export default memo(MyChatConfirmationMessage)
