import React, { memo, useCallback } from 'react'
import * as WebBrowser from 'expo-web-browser'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import type { IconName } from '@/types/icon'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { MessageAction } from './types'

interface ChatActionButtonProps {
  action: MessageAction
  onAction: (action: MessageAction) => void
}

function handleExternalLink(url: string) {
  void WebBrowser.openBrowserAsync(url)
}

function ChatActionButton({ action, onAction }: ChatActionButtonProps) {
  const handlePress = useCallback(() => {
    if (action.type === 'external_link') {
      handleExternalLink(action.url)
      return
    }
    onAction(action)
  }, [action, onAction])

  return (
    <MyButton
      text={action.label}
      type="secondary"
      width="full"
      elevation="none"
      left={
        <ConditionRenderer when={Boolean(action.icon)}>
          <MyIcon name={action.icon as IconName} size={16} />
        </ConditionRenderer>
      }
      onPress={handlePress}
    />
  )
}

export interface MyChatActionRowProps {
  actions: MessageAction[]
  onAction: (action: MessageAction) => void
}

function MyChatActionRow({ actions, onAction }: MyChatActionRowProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <MyView style={styles.resultActionsColumn}>
      {actions.map((action, index) => (
        <ChatActionButton
          key={`chat-action-${index}-${action.label}`}
          action={action}
          onAction={onAction}
        />
      ))}
    </MyView>
  )
}

export default memo(MyChatActionRow)
