import {
  formatCompactAxis,
  formatCompactNumber,
  formatCompactVnd,
  formatCompactVndWithCurrency,
} from './format-number'

describe('formatCompactNumber', () => {
  it('formats tỷ and triệu (short)', () => {
    expect(formatCompactNumber(10_000_000_000)).toBe('10 Tỷ')
    expect(formatCompactNumber(1_800_000_000)).toBe('1.8 Tỷ')
    expect(formatCompactNumber(701_084_480)).toBe('701.1 Tr')
    expect(formatCompactNumber(2_500_000)).toBe('2.5 Tr')
    expect(formatCompactNumber(0)).toBe('0')
  })

  it('formats long Vietnamese units', () => {
    expect(formatCompactNumber(10_000_000_000, { style: 'long' })).toBe('10 tỷ')
    expect(formatCompactNumber(701_084_480, { style: 'long' })).toBe('701.1 triệu')
  })

  it('formats dense axis style', () => {
    expect(formatCompactAxis(800_000_000)).toBe('800Tr')
    expect(formatCompactAxis(1_000_000_000)).toBe('1Tỷ')
    expect(formatCompactAxis(12_500)).toBe('12.5K')
  })

  it('preserves sign and currency suffix', () => {
    expect(formatCompactNumber(-2_000_000)).toBe('-2 Tr')
    expect(formatCompactVndWithCurrency(1_800_000_000)).toBe('1.8 Tỷ VNĐ')
    expect(formatCompactVnd(701_084_480)).toBe('701.1 Tr')
  })

  it('falls back to locale below 1 triệu', () => {
    expect(formatCompactNumber(999_999)).toBe((999_999).toLocaleString('vi-VN'))
  })
})
