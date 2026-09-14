import React, { memo } from 'react'
import Head from 'expo-router/head'

import { useCanonicalUrl } from '@/hooks/use-canonical-url'

export interface FilterPageSeoProps {
  /**
   * Query params allowed to stay in the canonical URL without triggering noindex
   * (typically just `['page']`). @default []
   */
  allowedParams?: string[]
}

/**
 * Drop this into any list/category/search screen that can be reached with filter or facet
 * query params (color, size, sort, price range, ...). Renders `<link rel="canonical">` pointing
 * at the clean, unfiltered URL, and `<meta name="robots" content="noindex, follow">` whenever
 * the current URL carries a filter param — so Google indexes the clean category page instead of
 * every filter combination, without blocking crawl of links found on the page (`follow`).
 * See `.docs/seo-standard.md` § "Applying SEO to a real e-commerce product".
 */
function FilterPageSeoInner({ allowedParams = [] }: FilterPageSeoProps) {
  const { canonicalUrl, shouldNoIndex } = useCanonicalUrl(allowedParams)

  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
      {shouldNoIndex ? <meta name="robots" content="noindex, follow" /> : null}
    </Head>
  )
}

export const FilterPageSeo = memo(FilterPageSeoInner)
