import { DROPDOWN_FULLSCREEN_MIN_OPTIONS } from '@/constants/constants'

import type { DropdownOption } from './type'
import { DROPDOWN_MIN_ITEMS } from './styles'

export const DROPDOWN_SEARCH_DEBOUNCE_MS = 300
export const DROPDOWN_SELECT_CLOSE_MS = 80

export function shouldShowDropdownSearch(optionCount: number): boolean {
  return optionCount > DROPDOWN_MIN_ITEMS
}

export function shouldUseDropdownBottomSheet(optionCount: number): boolean {
  return optionCount < DROPDOWN_FULLSCREEN_MIN_OPTIONS
}

export function normalizeDropdownSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function compactSearchText(value: string): string {
  return normalizeDropdownSearchText(value).replace(/\s+/g, '')
}

function subsequenceScore(haystack: string, needle: string): number {
  if (needle.length === 0) {
    return 1
  }
  let from = 0
  let first = -1
  for (let index = 0; index < needle.length; index += 1) {
    const found = haystack.indexOf(needle[index], from)
    if (found < 0) {
      return 0
    }
    if (first < 0) {
      first = found
    }
    from = found + 1
  }
  const span = from - first
  return Math.max(1, 400 - span - first)
}

export function scoreDropdownQuery(haystack: string, query: string): number {
  const normalizedHaystack = normalizeDropdownSearchText(haystack)
  const normalizedQuery = normalizeDropdownSearchText(query)
  if (normalizedQuery.length === 0) {
    return 1
  }
  const compactHaystack = compactSearchText(haystack)
  const compactQuery = compactSearchText(query)
  if (compactHaystack === compactQuery) {
    return 1000
  }
  if (compactHaystack.startsWith(compactQuery)) {
    return 900
  }
  if (normalizedHaystack.startsWith(normalizedQuery)) {
    return 850
  }
  const compactIndex = compactHaystack.indexOf(compactQuery)
  if (compactIndex >= 0) {
    return 800 - compactIndex
  }
  const spacedIndex = normalizedHaystack.indexOf(normalizedQuery)
  if (spacedIndex >= 0) {
    return 700 - spacedIndex
  }
  return subsequenceScore(compactHaystack, compactQuery)
}

export function filterDropdownOptions(options: DropdownOption[], query: string): DropdownOption[] {
  const needle = query.trim()
  if (needle.length === 0) {
    return options
  }
  return options
    .map((option, index) => ({
      option,
      index,
      score: Math.max(
        scoreDropdownQuery(option.label, needle),
        scoreDropdownQuery(option.suffix ?? '', needle),
        scoreDropdownQuery(option.value, needle),
      ),
    }))
    .filter((row) => row.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((row) => row.option)
}

export function dropdownOptionKey(item: DropdownOption, index: number): string {
  return `dropdown-option-${item.value}-${index}`
}
