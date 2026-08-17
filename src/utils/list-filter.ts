export type DateRangeFilter = {
  fromDate: string | null
  toDate: string | null
}

export function formatFilterDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseFilterDate(value: string | null): Date | null {
  if (!value) {
    return null
  }
  const parts = value.split('-')
  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])
  if (!year || !month || !day) {
    return null
  }
  return new Date(year, month - 1, day)
}

export function thisMonthRange(now = new Date()): DateRangeFilter {
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { fromDate: formatFilterDate(from), toDate: formatFilterDate(to) }
}

export function lastMonthRange(now = new Date()): DateRangeFilter {
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const to = new Date(now.getFullYear(), now.getMonth(), 0)
  return { fromDate: formatFilterDate(from), toDate: formatFilterDate(to) }
}

export function toggleFilterId(ids: string[], id: string): string[] {
  if (ids.includes(id)) {
    return ids.filter((item) => item !== id)
  }
  return [...ids, id]
}

/** Inclusive `YYYY-MM-DD` bounds as `from`/`to` datetime strings (end of `to` day). */
export function toApiDateTimeRange(
  fromDate: string | null,
  toDate: string | null,
): {
  from?: string
  to?: string
} {
  if (!fromDate || !toDate) {
    return {}
  }
  return {
    from: `${fromDate} 00:00:00`,
    to: `${toDate} 23:59:59`,
  }
}

export function singleDropdownValue(value: string | string[]): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) {
    return null
  }
  return raw
}
