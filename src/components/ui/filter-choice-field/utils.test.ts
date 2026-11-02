import { shouldUseFilterDropdown, toggledFilterIds } from './utils'

describe('filter-choice-field', () => {
  it('uses a dropdown from 3 options upward', () => {
    expect(shouldUseFilterDropdown(0)).toBe(false)
    expect(shouldUseFilterDropdown(2)).toBe(false)
    expect(shouldUseFilterDropdown(3)).toBe(true)
    expect(shouldUseFilterDropdown(40)).toBe(true)
  })

  it('lists ids that were added or removed', () => {
    expect(toggledFilterIds(['1', '2'], ['2', '3'])).toEqual(['1', '3'])
    expect(toggledFilterIds(['1', '2'], [])).toEqual(['1', '2'])
    expect(toggledFilterIds([], ['4'])).toEqual(['4'])
    expect(toggledFilterIds(['1'], ['1'])).toEqual([])
  })
})
