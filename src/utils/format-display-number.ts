/**
 * Locale-aware display numbers for inputs / labels:
 * - thousands grouping (`1.000.000` vi-VN, `1,000,000` en-US)
 * - strip trailing fraction zeros (API `100000.00` → `100.000`)
 * - parse typed display text back to canonical form (`.` decimal, no groups)
 */

export type FormatDisplayNumberOptions = {
  /** BCP47 or app short code (`vi` / `en`). Default `vi-VN`. */
  locale?: string
  /** Max fraction digits kept when formatting (default 2). Trailing zeros are omitted. */
  maxFractionDigits?: number
}

export function toNumberLocale(locale?: string): string {
  if (!locale) {
    return 'vi-VN'
  }
  const normalized = locale.trim()
  if (normalized === 'vi' || normalized.startsWith('vi-') || normalized.startsWith('vi_')) {
    return 'vi-VN'
  }
  if (normalized === 'en' || normalized.startsWith('en-') || normalized.startsWith('en_')) {
    return 'en-US'
  }
  return normalized
}

export function getNumberSeparators(locale?: string): { group: string; decimal: string } {
  const resolved = toNumberLocale(locale)

  // Hermes / RN Intl often lacks `formatToParts` — prefer known locales, then probe.
  if (resolved === 'vi-VN') {
    return { group: '.', decimal: ',' }
  }
  if (resolved === 'en-US') {
    return { group: ',', decimal: '.' }
  }

  const formatter = new Intl.NumberFormat(resolved)
  if (typeof formatter.formatToParts === 'function') {
    const parts = formatter.formatToParts(12345.6)
    return {
      group: parts.find((part) => part.type === 'group')?.value ?? ',',
      decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    }
  }

  // Probe: `12345.6` → infer separators from formatted string.
  const sample = formatter.format(12345.6)
  const match = /^(\d{1,3})([^\d])(\d{3})([^\d])(\d+)$/.exec(sample)
  if (match) {
    return { group: match[2], decimal: match[4] }
  }
  const decimalOnly = /^(\d+)([^\d])(\d+)$/.exec(sample)
  if (decimalOnly) {
    return { group: ',', decimal: decimalOnly[2] }
  }
  return { group: ',', decimal: '.' }
}

function toFiniteNumber(value: string | number): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  const trimmed = value.trim()
  if (!trimmed || trimmed === '-' || trimmed === '.') {
    return null
  }
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

/**
 * Format a canonical number (`100000`, `100000.5`, `100000.00`) for display.
 * Empty / non-numeric → `''` (except bare `-` while typing is handled by input helper).
 */
export function formatDisplayNumber(
  value: string | number | null | undefined,
  options: FormatDisplayNumberOptions = {},
): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string' && value.trim() === '') {
    return ''
  }

  const n = toFiniteNumber(typeof value === 'number' ? value : value.trim())
  if (n === null) {
    return ''
  }

  const locale = toNumberLocale(options.locale)
  const maxFractionDigits = options.maxFractionDigits ?? 2

  return new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  }).format(n)
}

/**
 * Parse display / mixed input into canonical storage string:
 * no grouping, ASCII `.` decimal (e.g. `100000.5`).
 */
export function parseDisplayNumber(text: string, locale?: string, maxFractionDigits = 2): string {
  const { value } = sanitizeDisplayNumberInput(text, { locale, maxFractionDigits })
  return value
}

export type SanitizeDisplayNumberResult = {
  /** Text shown in the field (grouped, locale decimal). */
  display: string
  /** Canonical value for form / API (`.` decimal, no groups). */
  value: string
}

/**
 * Sanitize keystrokes for a number field: strip illegal chars, cap fraction digits,
 * re-apply locale grouping for display, keep canonical `value` for RHF/API.
 */
export function sanitizeDisplayNumberInput(
  text: string,
  options: FormatDisplayNumberOptions = {},
): SanitizeDisplayNumberResult {
  const locale = toNumberLocale(options.locale)
  const maxFractionDigits = options.maxFractionDigits ?? 2
  const { group, decimal } = getNumberSeparators(locale)

  const raw = text ?? ''
  if (raw.trim() === '') {
    return { display: '', value: '' }
  }

  let sign = ''
  let body = raw.trim()
  if (body.startsWith('-')) {
    sign = '-'
    body = body.slice(1)
  }

  // Drop grouping symbols; treat both locale decimal and ASCII `.` as decimal.
  let sawDecimal = false
  let intDigits = ''
  let fracDigits = ''

  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]
    if (ch >= '0' && ch <= '9') {
      if (sawDecimal) {
        if (fracDigits.length < maxFractionDigits) {
          fracDigits += ch
        }
      } else {
        intDigits += ch
      }
      continue
    }
    if (ch === group) {
      continue
    }
    if (ch === decimal || ch === '.') {
      if (!sawDecimal) {
        sawDecimal = true
      }
    }
  }

  if (!intDigits && !fracDigits && !sawDecimal) {
    return { display: sign, value: '' }
  }

  if (!intDigits) {
    intDigits = '0'
  }

  // Canonical value — omit trailing decimal with empty fraction.
  let value = `${sign}${intDigits}`
  if (fracDigits.length > 0) {
    value = `${sign}${intDigits}.${fracDigits}`
  }

  const intNumber = Number(intDigits)
  const groupedInt = Number.isFinite(intNumber)
    ? new Intl.NumberFormat(locale, {
        useGrouping: true,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(intNumber)
    : intDigits

  let display = `${sign}${groupedInt}`
  if (sawDecimal) {
    display += `${decimal}${fracDigits}`
  }

  return { display, value }
}
