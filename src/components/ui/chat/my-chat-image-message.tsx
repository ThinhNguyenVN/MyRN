import React, { memo } from 'react'

import MyImage from '@/components/elements/my-image'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ImageMessage } from './types'

export interface MyChatImageMessageProps {
  message: ImageMessage
}

function MyChatImageMessage({ message }: MyChatImageMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const isUser = message.role === 'user'

  const image = (
    <MyImage url={message.imageUri} style={styles.imageBubbleImage} contentFit="cover" />
  )

  if (isUser) {
    return (
      <MySurface radius="large" style={styles.userBubble}>
        {image}
      </MySurface>
    )
  }

  return (
    <MyView style={styles.assistantContent}>
      {image}
      <ConditionRenderer when={Boolean(message.caption)}>
        <MyText typography="body">{message.caption}</MyText>
      </ConditionRenderer>
    </MyView>
  )
}

export default memo(MyChatImageMessage)
