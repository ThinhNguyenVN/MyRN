import React, { memo } from 'react'
import type { ChatSummaryField } from '@thinhnguyenvn/chat-core'

import MyTag from '@/components/elements/my-tag'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { tagTone, textTone, trendLabel } from './result-card-layout'
import { generateStyles } from './styles'

export interface MyChatSummaryListProps {
  keyPrefix: string
  summary: ChatSummaryField[]
  changedFields?: string[]
}

function MyChatSummaryList({ keyPrefix, summary, changedFields }: MyChatSummaryListProps) {
  const styles = useThemedStyles(generateStyles)

  return (
    <MyView style={styles.summaryList}>
      {summary.map((field) => {
        const isChanged = changedFields?.includes(field.label) ?? false
        const valueColor = isChanged
          ? 'text/info/primary'
          : field.tone
            ? textTone(field.tone)
            : undefined
        return (
          <MyView key={`${keyPrefix}-${field.label}`} style={styles.summaryRow}>
            <MyView style={styles.summaryLabelGroup}>
              {isChanged ? <MyView style={styles.changedDot} /> : null}
              <MyText
                typography="caption"
                color="text/active/secondary"
                style={styles.summaryLabel}
              >
                {field.label}
              </MyText>
              <ConditionRenderer when={Boolean(field.badge)}>
                <MyTag
                  label={field.badge?.text ?? ''}
                  tone={tagTone(field.badge?.tone)}
                  size="compact"
                />
              </ConditionRenderer>
            </MyView>
            <MyView style={styles.summaryValueGroup}>
              <MyText typography="label" color={valueColor} style={styles.summaryValue}>
                {field.value}
              </MyText>
              <ConditionRenderer when={Boolean(field.trend)}>
                <MyText typography="caption" color={textTone(field.trend?.tone)}>
                  {field.trend ? trendLabel(field.trend) : ''}
                </MyText>
              </ConditionRenderer>
            </MyView>
          </MyView>
        )
      })}
    </MyView>
  )
}

export default memo(MyChatSummaryList)
