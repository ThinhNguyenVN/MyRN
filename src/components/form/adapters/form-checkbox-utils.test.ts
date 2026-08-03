import { resolveCheckboxChecked } from './form-checkbox-utils'

describe('resolveCheckboxChecked', () => {
  it('is true only for boolean true', () => {
    expect(resolveCheckboxChecked(true)).toBe(true)
    expect(resolveCheckboxChecked(false)).toBe(false)
    expect(resolveCheckboxChecked(undefined)).toBe(false)
    expect(resolveCheckboxChecked('yes')).toBe(false)
  })
})
