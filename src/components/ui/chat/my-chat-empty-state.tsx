import React, { memo, useMemo } from 'react'
import { Keyboard } from 'react-native'

import MyChip from '@/components/elements/my-chip'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTheme, useThemedStyles } from '@/theme/theme-context'

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
  columnGutter: number
  composerHeight: number
}

function MyChatEmptyState({
  title,
  subtitle,
  suggestions,
  columnGutter,
  composerHeight,
}: MyChatEmptyStateProps) {
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
  const emptyStyle = useMemo(() => {
    const next = [styles.emptyState, { paddingHorizontal: columnGutter }]
    if (composerHeight <= 0) {
      return next
    }
    return [...next, { paddingBottom: composerHeight + getSpacing('x4') }]
  }, [columnGutter, composerHeight, getSpacing, styles.emptyState])

  return (
    <MyPressable
      onPress={dismissKeyboard}
      style={emptyStyle}
      scaleValue={1}
      haptic={false}
      preventMultiPress={false}
    >
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
    </MyPressable>
  )
}

export default memo(MyChatEmptyState)
