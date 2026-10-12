import React, { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MediaChoiceMessage } from '@thinhnguyenvn/chat-core'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import MyChatCardLockRow from './my-chat-card-lock-row'
import MyChatMediaRow from './my-chat-media-row'
import MyChatMediaThumbnail from './my-chat-media-thumbnail'
import { generateStyles } from './styles'

interface MediaChoiceCellProps {
  mediaId: string
  isSelected: boolean
  /** Full at `max`: unselected cells cannot be added, so they dim. */
  isBlocked: boolean
  onToggle: (mediaId: string) => void
}

function MediaChoiceCell({ mediaId, isSelected, isBlocked, onToggle }: MediaChoiceCellProps) {
  const styles = useThemedStyles(generateStyles)
  const handlePress = useCallback(() => {
    onToggle(mediaId)
  }, [mediaId, onToggle])

  return (
    <MyPressable
      onPress={handlePress}
      disabled={isBlocked}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled: isBlocked }}
    >
      <MyView style={isBlocked ? styles.mediaChoiceCellDimmed : undefined}>
        <MyChatMediaThumbnail
          mediaId={mediaId}
          style={[styles.mediaChoiceThumb, isSelected && styles.mediaChoiceCellSelected]}
        />
        <MyView style={[styles.mediaCheckBadge, isSelected && styles.mediaCheckBadgeSelected]}>
          {isSelected ? <MyIcon name="checkmark" size={14} color="icon/contrast/light" /> : null}
        </MyView>
      </MyView>
    </MyPressable>
  )
}

export interface MyChatMediaChoiceMessageProps {
  message: MediaChoiceMessage
  onSelectMedia: (messageId: string, mediaIds: string[]) => void
}

function MyChatMediaChoiceMessage({ message, onSelectMedia }: MyChatMediaChoiceMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string[]>([])
  const isLocked = message.lockState !== undefined
  const isResolved = message.selectedMediaIds !== undefined && !isLocked
  const isPending = message.selectedMediaIds === undefined && !isLocked
  const canSubmit = selected.length >= message.min && selected.length <= message.max

  const handleToggle = useCallback(
    (mediaId: string) => {
      setSelected((current) => {
        if (current.includes(mediaId)) {
          return current.filter((id) => id !== mediaId)
        }
        // A single pick swaps instead of blocking, like a radio.
        if (message.max === 1) {
          return [mediaId]
        }
        return current.length < message.max ? [...current, mediaId] : current
      })
    },
    [message.max],
  )

  const handleSubmit = useCallback(() => {
    // Keep the card's order, not the tap order.
    onSelectMedia(
      message.id,
      message.media.filter((id) => selected.includes(id)),
    )
  }, [message.id, message.media, onSelectMedia, selected])

  const isFull = message.max > 1 && selected.length >= message.max

  return (
    <MySurface radius="large" style={styles.interactiveCard}>
      <MyText typography="body">{message.prompt}</MyText>

      <ConditionRenderer when={isPending}>
        <MyView style={styles.mediaChoiceGrid}>
          {message.media.map((id) => {
            const isSelected = selected.includes(id)
            return (
              <MediaChoiceCell
                key={`chat-media-choice-${id}`}
                mediaId={id}
                isSelected={isSelected}
                isBlocked={isFull && !isSelected}
                onToggle={handleToggle}
              />
            )
          })}
        </MyView>
        <MyView style={styles.mediaChoiceFooter}>
          <MyText typography="caption" color="text/active/secondary">
            {t('components.chat.mediaSelectedCount', {
              count: selected.length,
              max: message.max,
            })}
          </MyText>
          <MyButton
            text={
              selected.length === 0
                ? t('components.chat.mediaSubmitNone')
                : t('components.chat.mediaSubmit')
            }
            type="primary"
            width="auto"
            elevation="none"
            disabled={!canSubmit}
            onPress={handleSubmit}
          />
        </MyView>
      </ConditionRenderer>

      {message.lockState ? <MyChatCardLockRow lockState={message.lockState} /> : null}

      <ConditionRenderer when={isResolved}>
        <ConditionRenderer when={Boolean(message.selectedMediaIds?.length)}>
          <MyChatMediaRow media={message.selectedMediaIds ?? []} />
        </ConditionRenderer>
        <MyView style={styles.resolvedRow}>
          <MyIcon name="checkmark-circle" size={16} color="icon/success/primary" />
          <MyText typography="label">
            {message.selectedMediaIds?.length
              ? t('components.chat.mediaSelected', { count: message.selectedMediaIds.length })
              : t('components.chat.mediaSelectedNone')}
          </MyText>
        </MyView>
      </ConditionRenderer>
    </MySurface>
  )
}

export default memo(MyChatMediaChoiceMessage)
