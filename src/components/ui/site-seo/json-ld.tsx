import React, { memo } from 'react'
import Head from 'expo-router/head'

export interface JsonLdProps {
  /** Output of `buildProductJsonLd` / `buildBreadcrumbJsonLd` (`src/utils/product-json-ld.ts`), or any plain schema.org object. */
  data: Record<string, unknown>
}

/**
 * Renders one `<script type="application/ld+json">` tag via `expo-router/head`.
 * Subject to the same static-export caveat as per-screen `<Head>` overrides documented in
 * `.docs/seo-standard.md` (absent from static HTML unless the route runs under SSR / is
 * mounted outside `AppInitGate` — Googlebot still sees it after hydration either way).
 */
function JsonLdInner({ data }: JsonLdProps) {
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Head>
  )
}

export const JsonLd = memo(JsonLdInner)
