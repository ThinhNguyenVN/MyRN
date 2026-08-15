import {
  formatDisplayNumber,
  getNumberSeparators,
  parseDisplayNumber,
  sanitizeDisplayNumberInput,
  toNumberLocale,
} from './format-display-number'

describe('toNumberLocale', () => {
  it('maps app language codes to BCP47', () => {
    expect(toNumberLocale('vi')).toBe('vi-VN')
    expect(toNumberLocale('en')).toBe('en-US')
    expect(toNumberLocale(undefined)).toBe('vi-VN')
  })
})

describe('getNumberSeparators', () => {
  it('uses . group and , decimal for vi-VN', () => {
    expect(getNumberSeparators('vi')).toEqual({ group: '.', decimal: ',' })
  })

  it('uses , group and . decimal for en-US', () => {
    expect(getNumberSeparators('en')).toEqual({ group: ',', decimal: '.' })
  })
})

describe('formatDisplayNumber', () => {
  it('groups thousands and drops trailing .00 (vi)', () => {
    expect(formatDisplayNumber('100000.00', { locale: 'vi' })).toBe('100.000')
    expect(formatDisplayNumber(100000, { locale: 'vi' })).toBe('100.000')
    expect(formatDisplayNumber('1000000', { locale: 'vi' })).toBe('1.000.000')
  })

  it('keeps meaningful fractions', () => {
    expect(formatDisplayNumber('100000.5', { locale: 'vi' })).toBe('100.000,5')
    expect(formatDisplayNumber('100000.50', { locale: 'vi' })).toBe('100.000,5')
  })

  it('uses en-US separators', () => {
    expect(formatDisplayNumber('1000000', { locale: 'en' })).toBe('1,000,000')
    expect(formatDisplayNumber('100000.5', { locale: 'en' })).toBe('100,000.5')
  })

  it('returns empty for blank / invalid', () => {
    expect(formatDisplayNumber('')).toBe('')
    expect(formatDisplayNumber(null)).toBe('')
    expect(formatDisplayNumber('abc')).toBe('')
  })
})

describe('parseDisplayNumber / sanitizeDisplayNumberInput', () => {
  it('parses vi grouped input to canonical', () => {
    expect(parseDisplayNumber('100.000', 'vi')).toBe('100000')
    expect(parseDisplayNumber('1.000.000,5', 'vi')).toBe('1000000.5')
  })

  it('parses en grouped input to canonical', () => {
    expect(parseDisplayNumber('1,000,000.5', 'en')).toBe('1000000.5')
  })

  it('formats while typing and caps fraction digits', () => {
    expect(sanitizeDisplayNumberInput('1000000', { locale: 'vi' })).toEqual({
      display: '1.000.000',
      value: '1000000',
    })
    expect(
      sanitizeDisplayNumberInput('1.000.000,567', { locale: 'vi', maxFractionDigits: 2 }),
    ).toEqual({
      display: '1.000.000,56',
      value: '1000000.56',
    })
  })

  it('keeps open decimal while typing', () => {
    expect(sanitizeDisplayNumberInput('1000,', { locale: 'vi' })).toEqual({
      display: '1.000,',
      value: '1000',
    })
  })
})
