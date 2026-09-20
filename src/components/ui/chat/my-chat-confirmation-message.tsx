import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

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
  const isResolved = message.resolution !== undefined

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
        <MyView style={styles.summaryList}>
          {message.summary?.map((field) => (
            <MyView key={`chat-confirmation-field-${field.label}`} style={styles.summaryRow}>
              <MyText typography="caption" color="text/active/secondary">
                {field.label}
              </MyText>
              <MyText typography="label">{field.value}</MyText>
            </MyView>
          ))}
        </MyView>
      </ConditionRenderer>

      <ConditionRenderer when={!isResolved}>
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
