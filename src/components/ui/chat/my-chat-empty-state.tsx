import React, { memo, useMemo } from 'react'
import { Keyboard } from 'react-native'

import MyChip from '@/components/elements/my-chip'
import MyIcon from '@/components/elements/my-icon'
import MyPressable from '@/components/elements/my-pressable'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useTranslation } from 'react-i18next'

import { useTheme, useThemedStyles } from '@/theme/theme-context'

import { chatIconName } from './chat-icons'
import { generateStyles } from './styles'

function dismissKeyboard() {
  Keyboard.dismiss()
}

export interface ChatSuggestion {
  id: string
  label: string
  onPress: () => void
}

/** A shortcut from the gateway (contract v4): `run` runs a tool, `prompt` sends its label. */
export interface ChatQuickActionItem {
  id: string
  label: string
  icon: string
  kind: 'run' | 'prompt'
  onPress: () => void
}

export interface MyChatEmptyStateProps {
  title: string
  subtitle?: string
  suggestions?: ChatSuggestion[]
  /** The gateway's greeting; with `quickActions` it replaces `title`, `subtitle` and `suggestions`. */
  greeting?: { title: string; subtitle: string }
  quickActions?: ChatQuickActionItem[]
  columnGutter: number
  composerHeight: number
}

function MyChatEmptyState({
  title,
  subtitle,
  suggestions,
  greeting,
  quickActions,
  columnGutter,
  composerHeight,
}: MyChatEmptyStateProps) {
  const { t } = useTranslation()
  const styles = useThemedStyles(generateStyles)
  const { getSpacing } = useTheme()
  const emptyStyle = useMemo(() => {
    const next = [styles.emptyState, { paddingHorizontal: columnGutter }]
    if (composerHeight <= 0) {
      return next
    }
    return [...next, { paddingBottom: composerHeight + getSpacing('x4') }]
  }, [columnGutter, composerHeight, getSpacing, styles.emptyState])

  if (greeting && quickActions?.length) {
    const toRow = (items: ChatQuickActionItem[]) => (
      <MyView style={styles.quickGrid}>
        {items.map((item) => (
          <QuickActionCard key={`chat-quick-${item.id}`} item={item} />
        ))}
      </MyView>
    )
    const runs = quickActions.filter((item) => item.kind === 'run')
    const prompts = quickActions.filter((item) => item.kind === 'prompt')
    return (
      <MyPressable
        onPress={dismissKeyboard}
        style={emptyStyle}
        scaleValue={1}
        haptic={false}
        preventMultiPress={false}
      >
        <MyView style={styles.greeting}>
          <MyView style={styles.greetingBadge}>
            <MyIcon name="sparkles" size={24} color="#ffffff" />
          </MyView>
          <MyText typography="h4" style={styles.greetingTitle}>
            {greeting.title}
          </MyText>
          <MyText typography="body" color="text/active/secondary" style={styles.greetingTitle}>
            {greeting.subtitle}
          </MyText>
        </MyView>
        <MyView style={styles.quickGroups}>
          <ConditionRenderer when={runs.length > 0}>
            <MyView style={styles.quickGroup}>
              <MyText
                typography="caption"
                color="text/active/tertiary"
                style={styles.quickGroupTitle}
              >
                {t('components.chat.quick.run')}
              </MyText>
              {toRow(runs)}
            </MyView>
          </ConditionRenderer>
          <ConditionRenderer when={prompts.length > 0}>
            <MyView style={styles.quickGroup}>
              <MyText
                typography="caption"
                color="text/active/tertiary"
                style={styles.quickGroupTitle}
              >
                {t('components.chat.quick.prompt')}
              </MyText>
              {toRow(prompts)}
            </MyView>
          </ConditionRenderer>
        </MyView>
      </MyPressable>
    )
  }

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

function QuickActionCard({ item }: { item: ChatQuickActionItem }) {
  const { t } = useTranslation()
  const styles = useThemedStyles(generateStyles)
  const isRun = item.kind === 'run'
  return (
    <MyPressable
      onPress={item.onPress}
      style={[styles.quickCard, isRun ? styles.quickCardRun : styles.quickCardPrompt]}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      haptic={false}
    >
      <MyView style={[styles.quickIcon, isRun ? styles.quickIconRun : styles.quickIconPrompt]}>
        <MyIcon
          name={chatIconName(item.icon)}
          size={18}
          color={isRun ? '#ffffff' : 'icon/active/secondary'}
        />
      </MyView>
      <MyText typography="label" style={styles.quickLabel} numberOfLines={2}>
        {item.label}
      </MyText>
      <MyText typography="caption" color="text/active/tertiary">
        {isRun ? t('components.chat.quick.runHint') : t('components.chat.quick.promptHint')}
      </MyText>
    </MyPressable>
  )
}

export default memo(MyChatEmptyState)
