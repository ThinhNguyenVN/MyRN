import React, { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImageMessage } from '@thinhnguyenvn/chat-core'

import MyImage from '@/components/elements/my-image'
import MyPressable from '@/components/elements/my-pressable'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles, getPhotoGridWidth } from './styles'

export interface MyChatImageMessageProps {
  message: ImageMessage
  /** Retries a failed upload (contract v3 `send_media`). */
  onRetry?: (messageId: string) => void
}

function MyChatImageMessage({ message, onRetry }: MyChatImageMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const isUser = message.role === 'user'
  const isUploading = isUser && message.status === 'pending'
  const isError = message.status === 'error'

  const handleRetry = useCallback(() => {
    onRetry?.(message.id)
  }, [message.id, onRetry])

  const image =
    message.imageUris.length === 1 ? (
      <MyImage url={message.imageUris[0]} style={styles.photoSingle} contentFit="cover" />
    ) : (
      <MyView style={[styles.photoGrid, { width: getPhotoGridWidth(message.imageUris.length) }]}>
        {message.imageUris.map((uri) => (
          <MyImage key={uri} url={uri} style={styles.photoGridCell} contentFit="cover" />
        ))}
      </MyView>
    )

  // Neutral card, not the brand-tinted "sent" bubble — see styles.ts photoCard comment.
  const photoCard = (
    <MySurface radius="large" style={[styles.photoCard, isUploading && styles.photoCardPending]}>
      {image}
    </MySurface>
  )

  if (isUser) {
    return (
      <MyView style={styles.userImageColumn}>
        {photoCard}
        <ConditionRenderer when={Boolean(message.caption)}>
          <MyView style={styles.userBubble}>
            <MyText typography="body" style={styles.userBubbleText}>
              {message.caption}
            </MyText>
          </MyView>
        </ConditionRenderer>
        <ConditionRenderer when={isError}>
          <MyView style={styles.errorRow}>
            <MyText typography="body" style={styles.errorText}>
              {t('components.chat.mediaUploadFailed')}
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

  return (
    <MyView style={styles.assistantContent}>
      {photoCard}
      <ConditionRenderer when={Boolean(message.caption)}>
        <MyText typography="body">{message.caption}</MyText>
      </ConditionRenderer>
    </MyView>
  )
}

export default memo(MyChatImageMessage)
