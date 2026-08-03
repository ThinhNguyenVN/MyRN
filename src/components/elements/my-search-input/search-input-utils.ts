import { isNil } from 'lodash'

export function shouldShowSearchClear(value: unknown): boolean {
  if (isNil(value)) return false
  if (typeof value === 'string') return value !== ''
  return true
}
