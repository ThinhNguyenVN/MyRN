import React, { memo, useCallback } from 'react'
import * as WebBrowser from 'expo-web-browser'
import type { MessageAction } from '@thinhnguyenvn/chat-core'

import MyButton from '@/components/elements/my-button'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import type { IconName } from '@/types/icon'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

/** `button` = full width secondary buttons; `link` = text rows with an arrow (result cards). */
export type ChatActionVariant = 'button' | 'link'

interface ChatActionButtonProps {
  action: MessageAction
  onAction: (action: MessageAction) => void
  variant: ChatActionVariant
}

function handleExternalLink(url: string) {
  void WebBrowser.openBrowserAsync(url)
}

function ChatActionButton({ action, onAction, variant }: ChatActionButtonProps) {
  const styles = useThemedStyles(generateStyles)
  const handlePress = useCallback(() => {
    if (action.type === 'external_link') {
      handleExternalLink(action.url)
      return
    }
    onAction(action)
  }, [action, onAction])

  if (variant === 'link') {
    return (
      <MyPressable accessibilityRole="link" onPress={handlePress} style={styles.resultLinkRow}>
        <MyView style={styles.resultLinkLabel}>
          <ConditionRenderer when={Boolean(action.icon)}>
            <MyIcon name={action.icon as IconName} size={16} color="icon/info/primary" />
          </ConditionRenderer>
          <MyText typography="button" color="text/info/primary">
            {action.label}
          </MyText>
        </MyView>
        <MyIcon
          name={action.type === 'external_link' ? 'open-outline' : 'chevron-forward'}
          size={16}
          color="icon/info/primary"
        />
      </MyPressable>
    )
  }

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
  /** @default 'button' */
  variant?: ChatActionVariant
}

function MyChatActionRow({ actions, onAction, variant = 'button' }: MyChatActionRowProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <MyView style={variant === 'link' ? styles.resultLinks : styles.resultActionsColumn}>
      {actions.map((action, index) => (
        <ChatActionButton
          key={`chat-action-${index}-${action.label}`}
          action={action}
          onAction={onAction}
          variant={variant}
        />
      ))}
    </MyView>
  )
}

export default memo(MyChatActionRow)
