import React, { memo, useCallback } from 'react'

import MyChip from '@/components/elements/my-chip'
import MyIcon from '@/components/elements/my-icon'
import MySurface from '@/components/elements/my-surface'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ChatOption, OptionsMessage } from './types'

interface OptionChipProps {
  messageId: string
  option: ChatOption
  onSelectOption: (messageId: string, optionId: string) => void
}

function OptionChip({ messageId, option, onSelectOption }: OptionChipProps) {
  const handlePress = useCallback(() => {
    onSelectOption(messageId, option.id)
  }, [messageId, option.id, onSelectOption])

  return <MyChip label={option.label} type="outlined" elevation="none" onPress={handlePress} />
}

export interface MyChatOptionsMessageProps {
  message: OptionsMessage
  onSelectOption: (messageId: string, optionId: string) => void
}

function MyChatOptionsMessage({ message, onSelectOption }: MyChatOptionsMessageProps) {
  const styles = useThemedStyles(generateStyles)
  const isResolved = message.selectedOptionId !== undefined
  const selectedLabel = message.options.find(
    (option) => option.id === message.selectedOptionId,
  )?.label

  return (
    <MySurface radius="large" style={styles.interactiveCard}>
      <MyText typography="body">{message.prompt}</MyText>

      <ConditionRenderer when={!isResolved}>
        <MyView style={styles.optionsRow}>
          {message.options.map((option) => (
            <OptionChip
              key={`chat-option-${option.id}`}
              messageId={message.id}
              option={option}
              onSelectOption={onSelectOption}
            />
          ))}
        </MyView>
      </ConditionRenderer>

      <ConditionRenderer when={isResolved}>
        <MyView style={styles.resolvedRow}>
          <MyIcon name="checkmark-circle" size={16} color="icon/success/primary" />
          <MyText typography="label">{selectedLabel}</MyText>
        </MyView>
      </ConditionRenderer>
    </MySurface>
  )
}

export default memo(MyChatOptionsMessage)
