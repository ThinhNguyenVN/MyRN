/** Checkbox list stays for 1–2 options. Three or more become a dropdown. */
export const FILTER_DROPDOWN_MIN_OPTIONS = 3

export function shouldUseFilterDropdown(optionCount: number): boolean {
  return optionCount >= FILTER_DROPDOWN_MIN_OPTIONS
}

/** Ids whose membership changed between two selections. */
export function toggledFilterIds(current: string[], next: string[]): string[] {
  const nextSet = new Set(next)
  const currentSet = new Set(current)
  const changed: string[] = []
  for (const id of current) {
    if (!nextSet.has(id)) {
      changed.push(id)
    }
  }
  for (const id of next) {
    if (!currentSet.has(id)) {
      changed.push(id)
    }
  }
  return changed
}
