import { resolveDividerOrientation } from './divider-utils'

describe('resolveDividerOrientation', () => {
  it('defaults to horizontal', () => {
    expect(resolveDividerOrientation(undefined)).toBe('horizontal')
  })

  it('keeps vertical when requested', () => {
    expect(resolveDividerOrientation('vertical')).toBe('vertical')
  })
})
