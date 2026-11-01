/**
 * Route pattern without groups, e.g. `['(private)', 'todo', '[id]']` → `/todo/[id]`.
 * Keeps `screen_name` low-cardinality (ids stay out of analytics).
 */
export function toScreenName(segments: readonly string[]): string {
  const parts = segments.filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
  return `/${parts.join('/')}`
}
