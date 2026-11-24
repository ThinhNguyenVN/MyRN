import { formatDecimalString, normalizeDecimal } from './format-decimal'

describe('format-decimal', () => {
  it.each([
    ['1500000.00', 'vi', '1.500.000'],
    ['1234.50', 'vi', '1.234,5'],
    ['1234.50', 'en', '1,234.5'],
    ['-20000', 'vi', '-20.000'],
    ['abc', 'vi', 'abc'],
  ] as const)('formats %p (%s) → %p', (input, locale, expected) => {
    expect(formatDecimalString(input, locale)).toBe(expected)
  })

  it.each([
    ['199000', '199000.00'],
    ['199000.5', '199000.50'],
    ['-12.3', '-12.30'],
    ['-0', '0.00'],
    ['007', '7.00'],
    ['1.234', null],
    ['1,5', null],
    ['', null],
  ])('normalizes %p → %p', (input, expected) => {
    expect(normalizeDecimal(input)).toBe(expected)
  })
})
