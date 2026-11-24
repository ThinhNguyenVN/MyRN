/** Decimal strings (money, quantities) from the BE: never coerced to `number`. */

const DECIMAL_RE = /^(-?)(\d+)(?:\.(\d{1,2}))?$/

/** Canonical `-?int.dd` form of a valid amount (≤ 2 decimals, may be negative), else null. */
export function normalizeDecimal(value: string): string | null {
  const match = DECIMAL_RE.exec(value.trim())
  if (!match) return null
  const [, sign, intPart, fraction = ''] = match
  const int = intPart.replace(/^0+(?=\d)/, '')
  const frac = fraction.padEnd(2, '0')
  const isZero = /^0+$/.test(int) && frac === '00'
  return `${isZero ? '' : sign}${int}.${frac}`
}

/**
 * Decimal STRING → display string with thousands separators, no number coercion (money may exceed
 * float precision). `"1500000.00"` → `"1.500.000"`; `"1234.50"` → `"1.234,5"` (vi style: `.` groups,
 * `,` decimals; en style is the reverse). Non-decimal input is returned unchanged.
 */
export function formatDecimalString(value: string, locale: 'vi' | 'en' = 'vi'): string {
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(value.trim())
  if (!match) return value
  const [, sign, intPart, fraction = ''] = match
  const group = locale === 'vi' ? '.' : ','
  const decimal = locale === 'vi' ? ',' : '.'
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, group)
  const trimmedFraction = fraction.replace(/0+$/, '')
  return `${sign}${grouped}${trimmedFraction ? `${decimal}${trimmedFraction}` : ''}`
}
