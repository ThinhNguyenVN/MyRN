/**
 * Canonical URL + noindex decision for a route that may render filtered/faceted variants
 * (category listing with color/size/sort query params, search results, etc.).
 *
 * Pure function so it's trivial to unit test; `src/hooks/use-canonical-url.ts` wraps it with
 * the actual Expo Router route state. See `.docs/seo-standard.md` § "Applying SEO to a real
 * e-commerce product" for when and how to use this.
 */

export type SearchParamsInput = Record<string, string | string[] | undefined>

export interface BuildCanonicalUrlOptions {
  /** Site origin, e.g. `seo.config.json.siteUrl`, no trailing slash required. */
  siteUrl: string
  /** Current route pathname, e.g. from `usePathname()`. */
  pathname: string
  /** Current route query params, e.g. from `useGlobalSearchParams()`. */
  searchParams?: SearchParamsInput
  /**
   * Query params that are allowed to stay in the canonical URL and do NOT trigger noindex
   * (typically just pagination, e.g. `['page']`). Every other param present is treated as a
   * filter/facet: it's stripped from the canonical URL and marks the page `noindex`.
   * @default []
   */
  allowedParams?: string[]
}

export interface CanonicalUrlResult {
  canonicalUrl: string
  /** true when the current URL has filter/facet params beyond `allowedParams`. */
  shouldNoIndex: boolean
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function buildCanonicalUrl({
  siteUrl,
  pathname,
  searchParams = {},
  allowedParams = [],
}: BuildCanonicalUrlOptions): CanonicalUrlResult {
  const cleanBase = siteUrl.replace(/\/$/, '')
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`

  const presentKeys = Object.keys(searchParams).filter((key) => searchParams[key] !== undefined)
  const filterKeys = presentKeys.filter((key) => !allowedParams.includes(key))
  const shouldNoIndex = filterKeys.length > 0

  const keptQuery = allowedParams
    .filter((key) => searchParams[key] !== undefined)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(firstValue(searchParams[key]) ?? '')}`)
    .join('&')

  const canonicalUrl = `${cleanBase}${cleanPath}${keptQuery ? `?${keptQuery}` : ''}`

  return { canonicalUrl, shouldNoIndex }
}
