import React, { memo } from 'react'
import Head from 'expo-router/head'

export interface JsonLdProps {
  /** Output of `buildProductJsonLd` / `buildBreadcrumbJsonLd` (`src/utils/product-json-ld.ts`), or any plain schema.org object. */
  data: Record<string, unknown>
}

/**
 * Renders one `<script type="application/ld+json">` tag via `expo-router/head`.
 * Present in the static-exported HTML for `(public)` web routes (see
 * `.docs/seo-standard.md` § "The AppInitGate gotcha"); still absent for `(private)`
 * routes, which keep their own init gate — Googlebot sees it after hydration either way.
 */
function JsonLdInner({ data }: JsonLdProps) {
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Head>
  )
}

export const JsonLd = memo(JsonLdInner)
