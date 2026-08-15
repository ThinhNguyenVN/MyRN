/**
 * Shared compact number formatters for UI (triệu / tỷ).
 * Prefer these over raw `toLocaleString` for money and large counts.
 */

export const ONE_THOUSAND = 1_000
export const ONE_MILLION = 1_000_000
export const ONE_BILLION = 1_000_000_000

export type CompactNumberStyle = 'short' | 'long' | 'dense'

export type FormatCompactNumberOptions = {
  /** `vi-VN` by default — used when value is below 1 triệu. */
  locale?: string
  /**
   * - `short` → `1.8 Tỷ`, `701.1 Tr` (default UI)
   * - `long` → `1.8 tỷ`, `701.1 triệu`
   * - `dense` → `1.8Tỷ`, `701.1Tr` (chart axes)
   */
  style?: CompactNumberStyle
  /** Max fraction digits for scaled values (default 1). */
  maxFractionDigits?: number
  /** Append currency label, e.g. `VNĐ`. */
  currency?: string | false
  /** Include thousands unit `K` / `nghìn` when |value| >= 1000 and < 1e6 (default false for UI money). */
  includeThousands?: boolean
}

function trimFraction(value: number, maxFractionDigits: number): string {
  const fixed = value.toFixed(maxFractionDigits)
  return fixed.replace(/\.?0+$/, '')
}

function unitLabel(kind: 'billion' | 'million' | 'thousand', style: CompactNumberStyle): string {
  if (style === 'long') {
    if (kind === 'billion') return 'tỷ'
    if (kind === 'million') return 'triệu'
    return 'nghìn'
  }
  if (style === 'dense') {
    if (kind === 'billion') return 'Tỷ'
    if (kind === 'million') return 'Tr'
    return 'K'
  }
  if (kind === 'billion') return 'Tỷ'
  if (kind === 'million') return 'Tr'
  return 'K'
}

function joinAmount(amount: string, unit: string, style: CompactNumberStyle): string {
  return style === 'dense' ? `${amount}${unit}` : `${amount} ${unit}`
}

/**
 * Compact a number for display: tỷ (≥1e9), triệu (≥1e6), optional nghìn (≥1e3).
 * Preserves sign. Non-finite → `'0'`.
 */
export function formatCompactNumber(
  value: number,
  options: FormatCompactNumberOptions = {},
): string {
  const {
    locale = 'vi-VN',
    style = 'short',
    maxFractionDigits = 1,
    currency = false,
    includeThousands = false,
  } = options

  if (!Number.isFinite(value)) return currency ? `0 ${currency}` : '0'
  if (value === 0) return currency ? `0 ${currency}` : '0'

  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)

  let body: string
  if (abs >= ONE_BILLION) {
    body = joinAmount(
      trimFraction(abs / ONE_BILLION, maxFractionDigits),
      unitLabel('billion', style),
      style,
    )
  } else if (abs >= ONE_MILLION) {
    body = joinAmount(
      trimFraction(abs / ONE_MILLION, maxFractionDigits),
      unitLabel('million', style),
      style,
    )
  } else if (includeThousands && abs >= ONE_THOUSAND) {
    body = joinAmount(
      trimFraction(abs / ONE_THOUSAND, maxFractionDigits),
      unitLabel('thousand', style),
      style,
    )
  } else {
    body = abs.toLocaleString(locale)
  }

  const withSign = `${sign}${body}`
  return currency ? `${withSign} ${currency}` : withSign
}

/** Money display: `1.8 Tỷ`, `701.1 Tr`. Below 1 triệu → locale digits. */
export function formatCompactVnd(
  value: number,
  options: Omit<FormatCompactNumberOptions, 'currency'> = {},
): string {
  return formatCompactNumber(value, { ...options, style: options.style ?? 'short' })
}

/** Money with `VNĐ` suffix — still compact for triệu/tỷ. */
export function formatCompactVndWithCurrency(
  value: number,
  options: Omit<FormatCompactNumberOptions, 'currency'> = {},
): string {
  return formatCompactNumber(value, {
    ...options,
    style: options.style ?? 'short',
    currency: 'VNĐ',
  })
}

/** Chart / axis labels — dense, includes nghìn as `K`. */
export function formatCompactAxis(
  value: number,
  options: Omit<FormatCompactNumberOptions, 'style' | 'includeThousands' | 'currency'> = {},
): string {
  return formatCompactNumber(value, {
    ...options,
    style: 'dense',
    includeThousands: true,
  })
}
