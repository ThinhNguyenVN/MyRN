import React, { memo } from 'react'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { useThemedStyles } from '@/theme/theme-context'

import { generateStyles } from './styles'
import type { ChatSummaryField } from './types'

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
        return (
          <MyView key={`${keyPrefix}-${field.label}`} style={styles.summaryRow}>
            <MyView style={styles.summaryLabelGroup}>
              {isChanged ? <MyView style={styles.changedDot} /> : null}
              <MyText typography="caption" color="text/active/secondary">
                {field.label}
              </MyText>
            </MyView>
            <MyText typography="label" color={isChanged ? 'text/info/primary' : undefined}>
              {field.value}
            </MyText>
          </MyView>
        )
      })}
    </MyView>
  )
}

export default memo(MyChatSummaryList)
