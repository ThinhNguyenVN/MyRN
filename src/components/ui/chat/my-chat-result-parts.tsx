import React, { memo } from 'react'
import type { ChatSummaryField } from '@thinhnguyenvn/chat-core'

import MyIcon from '@/components/elements/my-icon'
import MyTag from '@/components/elements/my-tag'
import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { ConditionRenderer } from '@/components/ui/condition-renderer'
import { useThemedStyles } from '@/theme/theme-context'

import { chatIconName } from './chat-icons'
import MyChatSummaryList from './my-chat-summary-list'
import { type ResultBlock, tagTone, textTone, trendLabel } from './result-card-layout'
import { generateStyles } from './styles'

/** Parts shared by the result card and the confirmation card (header, hero, tiles, sections). */

export interface ResultCardHeaderProps {
  title: string
  subtitle?: string
  icon?: string
  /** A destructive confirmation: a warning icon on a red tint. */
  danger?: boolean
}

export const ResultCardHeader = memo(function ResultCardHeader({
  title,
  subtitle,
  icon,
  danger = false,
}: ResultCardHeaderProps) {
  const styles = useThemedStyles(generateStyles)
  const hasIcon = danger || Boolean(icon)

  return (
    <MyView style={styles.resultHeader}>
      <ConditionRenderer when={hasIcon}>
        <MyView style={[styles.resultIcon, danger && styles.resultIconDanger]}>
          <MyIcon
            name={danger ? 'warning-outline' : chatIconName(icon ?? '')}
            size={18}
            color={danger ? 'icon/alert/primary' : 'icon/info/primary'}
          />
        </MyView>
      </ConditionRenderer>
      <MyView style={styles.resultHeaderText}>
        <MyText typography="subtitle">{title}</MyText>
        <ConditionRenderer when={Boolean(subtitle)}>
          <MyText typography="caption" color="text/active/tertiary">
            {subtitle}
          </MyText>
        </ConditionRenderer>
      </MyView>
    </MyView>
  )
})

/** A changed row's label gets the info dot and its value the info colour, as in the plain list. */
function ChangedLabel({ label, isChanged }: { label: string; isChanged: boolean }) {
  const styles = useThemedStyles(generateStyles)
  return (
    <MyView style={styles.summaryLabelGroup}>
      {isChanged ? <MyView style={styles.changedDot} /> : null}
      <MyText typography="caption" color="text/active/secondary">
        {label}
      </MyText>
    </MyView>
  )
}

const valueColor = (field: ChatSummaryField, isChanged: boolean) =>
  isChanged ? 'text/info/primary' : field.tone ? textTone(field.tone) : undefined

export const ResultHero = memo(function ResultHero({
  field,
  isChanged = false,
}: {
  field: ChatSummaryField
  isChanged?: boolean
}) {
  const styles = useThemedStyles(generateStyles)
  const hasChips = Boolean(field.trend || field.badge)

  return (
    <MyView style={styles.resultHero}>
      <ChangedLabel label={field.label} isChanged={isChanged} />
      <MyText typography="h3" color={valueColor(field, isChanged)}>
        {field.value}
      </MyText>
      <ConditionRenderer when={hasChips}>
        <MyView style={styles.resultTrendRow}>
          <ConditionRenderer when={Boolean(field.trend)}>
            <MyTag
              label={field.trend ? trendLabel(field.trend) : ''}
              tone={tagTone(field.trend?.tone)}
              size="compact"
            />
          </ConditionRenderer>
          <ConditionRenderer when={Boolean(field.badge)}>
            <MyTag
              label={field.badge?.text ?? ''}
              tone={tagTone(field.badge?.tone)}
              size="compact"
            />
          </ConditionRenderer>
          <ConditionRenderer when={Boolean(field.trend?.note)}>
            <MyText typography="caption" color="text/active/tertiary">
              {field.trend?.note}
            </MyText>
          </ConditionRenderer>
        </MyView>
      </ConditionRenderer>
    </MyView>
  )
})

function ResultTiles({
  rows,
  changedFields,
}: {
  rows: ChatSummaryField[]
  changedFields?: string[]
}) {
  const styles = useThemedStyles(generateStyles)
  return (
    <MyView style={styles.resultTiles}>
      {rows.map((field) => {
        const isChanged = changedFields?.includes(field.label) ?? false
        return (
          <MyView key={`chat-result-kpi-${field.label}`} style={styles.resultTile}>
            <ChangedLabel label={field.label} isChanged={isChanged} />
            <MyText typography="subtitle" color={valueColor(field, isChanged)}>
              {field.value}
            </MyText>
            <ConditionRenderer when={Boolean(field.trend)}>
              <MyText typography="caption" color={textTone(field.trend?.tone)}>
                {field.trend ? trendLabel(field.trend) : ''}
              </MyText>
            </ConditionRenderer>
          </MyView>
        )
      })}
    </MyView>
  )
}

/** The blocks after the hero: tile grids, and plain rows under an optional section heading. */
export const ResultBlocks = memo(function ResultBlocks({
  blocks,
  keyPrefix,
  changedFields,
}: {
  blocks: ResultBlock[]
  keyPrefix: string
  changedFields?: string[]
}) {
  const styles = useThemedStyles(generateStyles)
  return (
    <>
      {blocks.map((block, index) =>
        block.kind === 'kpis' ? (
          <ResultTiles
            key={`${keyPrefix}-block-${index}`}
            rows={block.rows}
            changedFields={changedFields}
          />
        ) : (
          <MyView
            key={`${keyPrefix}-block-${index}`}
            style={block.title ? styles.resultSection : undefined}
          >
            <ConditionRenderer when={Boolean(block.title)}>
              <MyText
                typography="caption"
                color="text/active/tertiary"
                style={styles.resultSectionTitle}
              >
                {block.title}
              </MyText>
            </ConditionRenderer>
            <MyChatSummaryList
              keyPrefix={`${keyPrefix}-field-${index}`}
              summary={block.rows}
              changedFields={changedFields}
            />
          </MyView>
        ),
      )}
    </>
  )
})
