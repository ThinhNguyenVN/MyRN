import React, { memo } from 'react'

import MyImage from '@/components/elements/my-image'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles, getPhotoGridWidth } from './styles'
import type { ImageMessage } from './types'

export interface MyChatImageMessageProps {
  message: ImageMessage
}

function MyChatImageMessage({ message }: MyChatImageMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const isUser = message.role === 'user'

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
    <MySurface radius="large" style={styles.photoCard}>
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
