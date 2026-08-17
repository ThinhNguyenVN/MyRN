import {
  formatFilterDate,
  lastMonthRange,
  parseFilterDate,
  singleDropdownValue,
  thisMonthRange,
  toApiDateTimeRange,
  toggleFilterId,
} from './list-filter'

describe('list-filter', () => {
  it('formats and parses YYYY-MM-DD', () => {
    expect(formatFilterDate(new Date(2026, 7, 16))).toBe('2026-08-16')
    expect(parseFilterDate('2026-08-16')?.getDate()).toBe(16)
    expect(parseFilterDate(null)).toBeNull()
  })

  it('builds this and last month ranges', () => {
    expect(thisMonthRange(new Date(2026, 7, 13))).toEqual({
      fromDate: '2026-08-01',
      toDate: '2026-08-31',
    })
    expect(lastMonthRange(new Date(2026, 0, 5))).toEqual({
      fromDate: '2025-12-01',
      toDate: '2025-12-31',
    })
  })

  it('toggles ids and serializes date bounds', () => {
    expect(toggleFilterId(['2'], '2')).toEqual([])
    expect(toggleFilterId([], '2')).toEqual(['2'])
    expect(toApiDateTimeRange(null, '2026-08-31')).toEqual({})
    expect(toApiDateTimeRange('2026-08-01', '2026-08-31')).toEqual({
      from: '2026-08-01 00:00:00',
      to: '2026-08-31 23:59:59',
    })
    expect(singleDropdownValue('358')).toBe('358')
    expect(singleDropdownValue(['358'])).toBe('358')
    expect(singleDropdownValue('')).toBeNull()
  })
})
