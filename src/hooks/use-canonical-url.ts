import { useGlobalSearchParams, usePathname } from 'expo-router'

import seoConfig from '@root/seo.config.json'
import type { SeoConfig } from '@/components/ui/site-seo/type'
import { buildCanonicalUrl } from '@/utils/canonical-url'
import type { CanonicalUrlResult } from '@/utils/canonical-url'

const config = seoConfig as SeoConfig

/**
 * Canonical URL + noindex decision for the CURRENT route, driven by `seo.config.json.siteUrl`
 * and the route's own pathname/query params. See `src/utils/canonical-url.ts` for the pure
 * logic and `.docs/seo-standard.md` § "Applying SEO to a real e-commerce product" for usage.
 *
 * @param allowedParams Query params that should stay in the canonical URL and not trigger
 * noindex (typically just `['page']`). Everything else present is treated as a filter/facet.
 */
export function useCanonicalUrl(allowedParams: string[] = []): CanonicalUrlResult {
  const pathname = usePathname()
  const searchParams = useGlobalSearchParams<Record<string, string | string[]>>()

  return buildCanonicalUrl({
    siteUrl: config.siteUrl,
    pathname,
    searchParams,
    allowedParams,
  })
}
