import type { ChatSummaryField, ChatTone } from '@thinhnguyenvn/chat-core'

import type { TagTone } from '@/components/elements/my-tag/type'
import type { TextColorType } from '@/theme/colors'

/** A run of tiles, or a run of plain rows under an optional section heading. */
export type ResultBlock =
  | { kind: 'kpis'; rows: ChatSummaryField[] }
  | { kind: 'rows'; title?: string; rows: ChatSummaryField[] }

export interface ResultLayout {
  hero?: ChatSummaryField
  blocks: ResultBlock[]
  /** Plain rows shown / all plain rows; hero and tiles are always shown and not counted. */
  shownRows: number
  totalRows: number
}

/**
 * How a result card's rows are drawn (spec ndjson-chat-contract): the first `hero` on top, `kpi`
 * rows in a row become one grid, a `section` row heads the rows after it. Only plain rows count
 * toward `limit`; a section left with no row shown is dropped.
 */
export function layoutResultCard(summary: ChatSummaryField[], limit: number): ResultLayout {
  let hero: ChatSummaryField | undefined
  const blocks: ResultBlock[] = []
  let shownRows = 0
  let totalRows = 0

  for (const field of summary) {
    const last = blocks[blocks.length - 1]
    if (field.style === 'hero' && !hero) {
      hero = field
    } else if (field.style === 'hero' || field.style === 'kpi') {
      if (last?.kind === 'kpis') last.rows.push(field)
      else blocks.push({ kind: 'kpis', rows: [field] })
    } else if (field.style === 'section') {
      blocks.push({ kind: 'rows', title: field.label, rows: [] })
    } else {
      totalRows += 1
      if (shownRows >= limit) continue
      shownRows += 1
      if (last?.kind === 'rows') last.rows.push(field)
      else blocks.push({ kind: 'rows', rows: [field] })
    }
  }

  return {
    hero,
    blocks: blocks.filter((block) => block.rows.length > 0),
    shownRows,
    totalRows,
  }
}

const TAG_TONE: Record<ChatTone, TagTone> = {
  positive: 'success',
  negative: 'alert',
  warning: 'warning',
  neutral: 'neutral',
}

const TEXT_TONE: Record<ChatTone, TextColorType> = {
  positive: 'text/success/primary',
  negative: 'text/alert/primary',
  warning: 'text/warning/primary',
  neutral: 'text/active/secondary',
}

/** No tone means neutral: the arrow alone never decides green or red. */
export const tagTone = (tone?: ChatTone): TagTone => TAG_TONE[tone ?? 'neutral'] ?? 'neutral'

export const textTone = (tone?: ChatTone): TextColorType =>
  TEXT_TONE[tone ?? 'neutral'] ?? 'text/active/secondary'

const ARROW = { up: '↑', down: '↓', flat: '→' } as const

export function trendLabel(trend: NonNullable<ChatSummaryField['trend']>): string {
  return `${ARROW[trend.direction] ?? ''} ${trend.text}`.trim()
}
