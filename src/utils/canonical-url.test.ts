import { buildCanonicalUrl } from './canonical-url'

describe('buildCanonicalUrl', () => {
  const siteUrl = 'https://example.com'
  const pathname = '/danh-muc/ao-thun'

  it('returns the clean path with no query when there are no search params', () => {
    const result = buildCanonicalUrl({ siteUrl, pathname })
    expect(result).toEqual({
      canonicalUrl: 'https://example.com/danh-muc/ao-thun',
      shouldNoIndex: false,
    })
  })

  it('strips a disallowed filter param from the canonical URL and marks noindex', () => {
    const result = buildCanonicalUrl({
      siteUrl,
      pathname,
      searchParams: { color: 'red' },
    })
    expect(result.canonicalUrl).toBe('https://example.com/danh-muc/ao-thun')
    expect(result.shouldNoIndex).toBe(true)
  })

  it('keeps an allowed param (e.g. pagination) and does not noindex', () => {
    const result = buildCanonicalUrl({
      siteUrl,
      pathname,
      searchParams: { page: '2' },
      allowedParams: ['page'],
    })
    expect(result.canonicalUrl).toBe('https://example.com/danh-muc/ao-thun?page=2')
    expect(result.shouldNoIndex).toBe(false)
  })

  it('noindexes when a disallowed param is present alongside an allowed one, but still keeps the allowed one in the canonical URL', () => {
    const result = buildCanonicalUrl({
      siteUrl,
      pathname,
      searchParams: { page: '2', color: 'red' },
      allowedParams: ['page'],
    })
    expect(result.canonicalUrl).toBe('https://example.com/danh-muc/ao-thun?page=2')
    expect(result.shouldNoIndex).toBe(true)
  })

  it('handles array-valued search params by taking the first value', () => {
    const result = buildCanonicalUrl({
      siteUrl,
      pathname,
      searchParams: { page: ['3', '4'] },
      allowedParams: ['page'],
    })
    expect(result.canonicalUrl).toBe('https://example.com/danh-muc/ao-thun?page=3')
  })

  it('normalizes a trailing slash on siteUrl and a missing leading slash on pathname', () => {
    const result = buildCanonicalUrl({ siteUrl: 'https://example.com/', pathname: 'about' })
    expect(result.canonicalUrl).toBe('https://example.com/about')
  })
})
