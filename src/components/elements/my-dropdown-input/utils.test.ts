import {
  filterDropdownOptions,
  normalizeDropdownSearchText,
  shouldShowDropdownSearch,
} from './utils'
import { DROPDOWN_MIN_ITEMS } from './styles'

describe('shouldShowDropdownSearch', () => {
  it('shows search only when the list is long enough to scroll', () => {
    expect(shouldShowDropdownSearch(DROPDOWN_MIN_ITEMS)).toBe(false)
    expect(shouldShowDropdownSearch(DROPDOWN_MIN_ITEMS + 1)).toBe(true)
  })
})

describe('normalizeDropdownSearchText', () => {
  it('strips Vietnamese diacritics and đ', () => {
    expect(normalizeDropdownSearchText('Thành bi (TBTP)')).toBe('thanh bi tbtp')
    expect(normalizeDropdownSearchText('Ký Hợp Đồng')).toBe('ky hop dong')
    expect(normalizeDropdownSearchText('Đồng Đen')).toBe('dong den')
  })
})

describe('filterDropdownOptions', () => {
  const options = [
    { label: 'BIA 33 (B0003)', value: '1' },
    { label: 'Test sp (1234)', value: '354' },
    { label: 'Sim Test Product (SIM-SKU-1)', value: '2' },
    { label: 'Thành bi (TBTP)', value: '10' },
    { label: 'Ký Hợp Đồng (KHD)', value: '11' },
    { label: 'Banana Island Apple', value: '99' },
  ]

  it('returns all options when the query is empty', () => {
    expect(filterDropdownOptions(options, '  ')).toEqual(options)
  })

  it('matches without diacritics and by product code', () => {
    expect(filterDropdownOptions(options, 'thanh bi')).toEqual([options[3]])
    expect(filterDropdownOptions(options, 'tbtp')).toEqual([options[3]])
    expect(filterDropdownOptions(options, 'ky hop')).toEqual([options[4]])
    expect(filterDropdownOptions(options, 'khd')).toEqual([options[4]])
  })

  it('supports fuzzy subsequence matches', () => {
    expect(filterDropdownOptions(options, 'thb')).toEqual([options[3]])
  })

  it('ranks tighter matches above weak fuzzy hits', () => {
    const ranked = filterDropdownOptions(options, 'bia')
    expect(ranked[0]).toEqual(options[0])
    expect(ranked).toContainEqual(options[5])
  })

  it('returns an empty list when nothing fuzzy-matches', () => {
    expect(filterDropdownOptions(options, 'zzzz')).toEqual([])
  })
})
