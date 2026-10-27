import React, { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ConfirmationMessage } from '@thinhnguyenvn/chat-core'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import MyChatCardLockRow from './my-chat-card-lock-row'
import MyChatMediaRow from './my-chat-media-row'
import { ResultBlocks, ResultCardHeader, ResultHero } from './my-chat-result-parts'
import { layoutResultCard } from './result-card-layout'
import { generateStyles } from './styles'

export interface MyChatConfirmationMessageProps {
  message: ConfirmationMessage
  onConfirm: (messageId: string, confirmed: boolean) => void
}

function MyChatConfirmationMessage({ message, onConfirm }: MyChatConfirmationMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const isLocked = message.lockState !== undefined
  const isResolved = message.resolution !== undefined && !isLocked
  const isPending = message.resolution === undefined && !isLocked
  // Every row of a write is shown: no row limit, unlike a result card.
  const layout = useMemo(
    () => layoutResultCard(message.summary ?? [], Number.POSITIVE_INFINITY),
    [message.summary],
  )

  const handleConfirm = useCallback(() => {
    onConfirm(message.id, true)
  }, [message.id, onConfirm])

  const handleCancel = useCallback(() => {
    onConfirm(message.id, false)
  }, [message.id, onConfirm])

  return (
    <MySurface radius="large" style={[styles.interactiveCard, styles.resultCard]}>
      <ResultCardHeader
        title={message.prompt}
        subtitle={message.subtitle}
        icon={message.icon}
        danger={message.destructive}
      />

      {layout.hero ? (
        <ResultHero
          field={layout.hero}
          isChanged={message.changedFields?.includes(layout.hero.label)}
        />
      ) : null}

      <ResultBlocks
        blocks={layout.blocks}
        keyPrefix="chat-confirmation"
        changedFields={message.changedFields}
      />

      <ConditionRenderer when={Boolean(message.media?.length)}>
        <MyChatMediaRow
          media={message.media ?? []}
          isChanged={message.changedFields?.includes('media')}
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
            type={message.destructive ? 'tertiary' : 'primary'}
            width="auto"
            elevation="none"
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
