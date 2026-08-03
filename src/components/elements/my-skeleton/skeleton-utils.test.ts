import { getSkeletonLayout, resolveSkeletonCount } from './skeleton-utils'

describe('skeleton-utils', () => {
  it('returns layouts per preset', () => {
    expect(getSkeletonLayout('listRow')[0]?.key).toBe('title')
    expect(getSkeletonLayout('textBlock').length).toBeGreaterThan(1)
    expect(getSkeletonLayout('card')[0]?.key).toBe('media')
  })

  it('resolves count safely', () => {
    expect(resolveSkeletonCount(undefined)).toBe(1)
    expect(resolveSkeletonCount(0)).toBe(1)
    expect(resolveSkeletonCount(3)).toBe(3)
  })
})
