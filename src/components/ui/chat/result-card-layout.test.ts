import type { ChatSummaryField } from '@thinhnguyenvn/chat-core'

import { layoutResultCard, tagTone, trendLabel } from './result-card-layout'

const row = (label: string, extra: Partial<ChatSummaryField> = {}): ChatSummaryField => ({
  label,
  value: '1',
  ...extra,
})

describe('layoutResultCard', () => {
  it('keeps an unstyled card as one block of rows, cut at the limit', () => {
    const layout = layoutResultCard([row('A'), row('B'), row('C')], 2)

    expect(layout.hero).toBeUndefined()
    expect(layout.blocks).toEqual([{ kind: 'rows', rows: [row('A'), row('B')] }])
    expect([layout.shownRows, layout.totalRows]).toEqual([2, 3])
  })

  it('puts the hero on top, groups tiles and sections, and counts only plain rows', () => {
    const layout = layoutResultCard(
      [
        row('Doanh thu', { style: 'hero' }),
        row('Lãi gộp', { style: 'kpi' }),
        row('Đơn', { style: 'kpi' }),
        { label: 'Đơn tạo mới', value: '', style: 'section' },
        row('Nháp'),
        row('Đã hủy'),
        { label: 'Khách hàng', value: '', style: 'section' },
        row('Khách mới'),
      ],
      2,
    )

    expect(layout.hero?.label).toBe('Doanh thu')
    expect(layout.blocks).toEqual([
      { kind: 'kpis', rows: [row('Lãi gộp', { style: 'kpi' }), row('Đơn', { style: 'kpi' })] },
      { kind: 'rows', title: 'Đơn tạo mới', rows: [row('Nháp'), row('Đã hủy')] },
    ])
    expect([layout.shownRows, layout.totalRows]).toEqual([2, 3])
  })

  it('draws a second hero as a tile', () => {
    const layout = layoutResultCard([row('A', { style: 'hero' }), row('B', { style: 'hero' })], 5)

    expect(layout.hero?.label).toBe('A')
    expect(layout.blocks).toEqual([{ kind: 'kpis', rows: [row('B', { style: 'hero' })] }])
  })
})

describe('tones and trends', () => {
  it('colours only by the tone the app gave', () => {
    expect(tagTone('positive')).toBe('success')
    expect(tagTone(undefined)).toBe('neutral')
  })

  it('draws the arrow from the direction', () => {
    expect(trendLabel({ direction: 'down', text: '8%' })).toBe('↓ 8%')
  })
})
