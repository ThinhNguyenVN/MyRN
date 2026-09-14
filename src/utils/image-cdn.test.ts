jest.mock('@/configs/image-cdn.config', () => ({
  IMAGE_CDN_PROVIDER: null,
}))

import { getOptimizedImageUrl } from './image-cdn'

describe('getOptimizedImageUrl', () => {
  it('returns the url unchanged when no provider is configured (default)', () => {
    expect(getOptimizedImageUrl('https://example.com/a.jpg', { width: 400 })).toBe(
      'https://example.com/a.jpg',
    )
  })

  it('returns falsy input unchanged instead of throwing', () => {
    expect(getOptimizedImageUrl('')).toBe('')
  })
})

describe('getOptimizedImageUrl with a configured provider', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('delegates to the configured provider with the given options', async () => {
    jest.doMock('@/configs/image-cdn.config', () => ({
      IMAGE_CDN_PROVIDER: (url: string, opts: { width?: number }) => `${url}?w=${opts.width}`,
    }))

    // Re-require after doMock so this module picks up the mocked config.
    const { getOptimizedImageUrl: getOptimizedImageUrlWithProvider } = await import('./image-cdn')
    expect(getOptimizedImageUrlWithProvider('https://example.com/a.jpg', { width: 400 })).toBe(
      'https://example.com/a.jpg?w=400',
    )
  })
})
