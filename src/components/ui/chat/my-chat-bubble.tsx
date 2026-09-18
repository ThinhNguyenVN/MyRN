import React, { memo } from 'react'

import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import type { RenderCustomMessage } from './chat-adapter'
import MyChatConfirmationMessage from './my-chat-confirmation-message'
import MyChatFormMessage from './my-chat-form-message'
import MyChatImageMessage from './my-chat-image-message'
import MyChatOptionsMessage from './my-chat-options-message'
import MyChatResultMessage from './my-chat-result-message'
import MyChatTextMessage from './my-chat-text-message'
import MyChatUnknownMessage from './my-chat-unknown-message'
import { generateStyles } from './styles'
import type { ChatFormValues, ChatMessage, MessageAction } from './types'

export interface MyChatBubbleProps {
  message: ChatMessage
  onSelectOption: (messageId: string, optionId: string) => void
  onConfirm: (messageId: string, confirmed: boolean) => void
  onSubmitForm: (messageId: string, values: ChatFormValues) => void
  onRetry: (messageId: string) => void
  onAction: (action: MessageAction) => void
  renderCustomMessage?: RenderCustomMessage
}

function renderBubbleByKind({
  message,
  onSelectOption,
  onConfirm,
  onSubmitForm,
  onRetry,
  onAction,
  renderCustomMessage,
}: MyChatBubbleProps) {
  switch (message.kind) {
    case 'text':
      return <MyChatTextMessage message={message} onRetry={onRetry} />
    case 'image':
      return <MyChatImageMessage message={message} />
    case 'options':
      return <MyChatOptionsMessage message={message} onSelectOption={onSelectOption} />
    case 'confirmation':
      return <MyChatConfirmationMessage message={message} onConfirm={onConfirm} />
    case 'form':
      return <MyChatFormMessage message={message} onSubmitForm={onSubmitForm} />
    case 'result':
      return <MyChatResultMessage message={message} onAction={onAction} />
    case 'custom':
      return (renderCustomMessage && renderCustomMessage(message)) || <MyChatUnknownMessage />
    default:
      return null
  }
}

function MyChatBubble({
  message,
  onSelectOption,
  onConfirm,
  onSubmitForm,
  onRetry,
  onAction,
  renderCustomMessage,
}: MyChatBubbleProps) {
  const styles = useThemedStyles(generateStyles)
  const rowStyle = message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant

  return (
    <MyView style={rowStyle}>
      {renderBubbleByKind({
        message,
        onSelectOption,
        onConfirm,
        onSubmitForm,
        onRetry,
        onAction,
        renderCustomMessage,
      })}
    </MyView>
  )
}

export default memo(MyChatBubble)
