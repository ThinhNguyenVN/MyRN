import { shouldShowSearchClear } from './search-input-utils'

describe('shouldShowSearchClear', () => {
  it('hides for empty values', () => {
    expect(shouldShowSearchClear(undefined)).toBe(false)
    expect(shouldShowSearchClear(null)).toBe(false)
    expect(shouldShowSearchClear('')).toBe(false)
  })

  it('shows for non-empty string', () => {
    expect(shouldShowSearchClear('abc')).toBe(true)
  })
})
