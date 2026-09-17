import React, { memo } from 'react'
import { Keyboard, Pressable } from 'react-native'

import MyChip from '@/components/elements/my-chip'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'

function dismissKeyboard() {
  Keyboard.dismiss()
}

export interface ChatSuggestion {
  id: string
  label: string
  onPress: () => void
}

export interface MyChatEmptyStateProps {
  title: string
  subtitle?: string
  suggestions?: ChatSuggestion[]
}

function MyChatEmptyState({ title, subtitle, suggestions }: MyChatEmptyStateProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <Pressable style={styles.emptyState} onPress={dismissKeyboard}>
      <MyView>
        <MyText typography="subtitle" style={styles.emptyTitle}>
          {title}
        </MyText>
        <ConditionRenderer when={Boolean(subtitle)}>
          <MyText typography="body" color="text/active/secondary" style={styles.emptyTitle}>
            {subtitle}
          </MyText>
        </ConditionRenderer>
      </MyView>

      <ConditionRenderer when={Boolean(suggestions?.length)}>
        <MyView style={styles.suggestionChips}>
          {suggestions?.map((suggestion) => (
            <MyChip
              key={`chat-suggestion-${suggestion.id}`}
              label={suggestion.label}
              type="outlined"
              elevation="none"
              onPress={suggestion.onPress}
            />
          ))}
        </MyView>
      </ConditionRenderer>
    </Pressable>
  )
}

export default memo(MyChatEmptyState)
