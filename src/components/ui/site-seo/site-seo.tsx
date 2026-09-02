import React, { memo } from 'react'
import Head from 'expo-router/head'

import seoConfig from '@root/seo.config.json'

import type { SeoConfig } from './type'

const config = seoConfig as SeoConfig

function absoluteUrl(path: string): string {
  if (!config.siteUrl) return path
  if (/^https?:\/\//.test(path)) return path
  return `${config.siteUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

const organizationJsonLd = config.organization.enabled
  ? JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config.organization.name,
      url: config.siteUrl || undefined,
      telephone: config.organization.phone || undefined,
      email: config.organization.email || undefined,
      address: config.organization.address
        ? { '@type': 'PostalAddress', streetAddress: config.organization.address }
        : undefined,
    })
  : null

// Site-wide default <head> tags, driven by `seo.config.json` (repo root).
// Mounted unconditionally in `src/app/_layout.tsx`, OUTSIDE `AppInitGate` — that gate
// returns null until `useAppInit` resolves inside a useEffect, which never runs during
// `expo export --platform web`, so anything under it (title/OG/JSON-LD included) would
// be missing from the exported static HTML. See `.docs/seo-standard.md`.
//
// A screen can override title/description for its own route by rendering its own
// `<Head>` (from `expo-router/head`) with just those tags — react-helmet-async merges
// same-key tags, last-rendered wins. That override only reaches static HTML for
// crawlers that execute JS (e.g. Googlebot), because the screen renders inside
// `AppInitGate`; non-JS bots only ever see this site-wide default. See
// `.docs/seo-standard.md` for the full explanation and when this matters.
const SiteSeoInner: React.FC = () => {
  if (!config.enabled) return null

  return (
    <Head>
      {config.defaultTitle ? <title>{config.defaultTitle}</title> : null}
      {config.defaultDescription ? (
        <meta name="description" content={config.defaultDescription} />
      ) : null}
      {config.defaultKeywords.length > 0 ? (
        <meta name="keywords" content={config.defaultKeywords.join(', ')} />
      ) : null}
      {config.themeColor ? <meta name="theme-color" content={config.themeColor} /> : null}
      {config.siteUrl ? <link rel="canonical" href={config.siteUrl} /> : null}

      <meta property="og:type" content="website" />
      {config.locale ? <meta property="og:locale" content={config.locale} /> : null}
      {config.defaultTitle ? <meta property="og:title" content={config.defaultTitle} /> : null}
      {config.defaultDescription ? (
        <meta property="og:description" content={config.defaultDescription} />
      ) : null}
      {config.siteUrl ? <meta property="og:url" content={config.siteUrl} /> : null}
      {config.ogImagePath ? (
        <meta property="og:image" content={absoluteUrl(config.ogImagePath)} />
      ) : null}

      {config.twitterCard ? <meta name="twitter:card" content={config.twitterCard} /> : null}
      {config.defaultTitle ? <meta name="twitter:title" content={config.defaultTitle} /> : null}
      {config.defaultDescription ? (
        <meta name="twitter:description" content={config.defaultDescription} />
      ) : null}
      {config.ogImagePath ? (
        <meta name="twitter:image" content={absoluteUrl(config.ogImagePath)} />
      ) : null}

      {!config.indexable ? <meta name="robots" content="noindex, nofollow" /> : null}

      {organizationJsonLd ? <script type="application/ld+json">{organizationJsonLd}</script> : null}
    </Head>
  )
}

export const SiteSeo = memo(SiteSeoInner)
