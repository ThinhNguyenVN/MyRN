#!/usr/bin/env node

/**
 * Generates `public/robots.txt` and `public/sitemap.xml` from `seo.config.json`.
 *
 * Not wired into `postinstall` on purpose — SEO is opt-in. A mobile-only or
 * internal/admin project can leave `seo.config.json` untouched (enabled: false) and
 * never needs to run this. Run manually (or in a web deploy pipeline) before
 * `expo export --platform web`:
 *
 *   node ./scripts/generate-seo-files.js
 *
 * Dynamic sitemap (e-commerce catalogs): a static `sitemapRoutes` list in `seo.config.json`
 * doesn't scale past a handful of marketing pages. Create `seo.sitemap.source.js` at the repo
 * root exporting an async `getSitemapEntries()`:
 *
 *   // seo.sitemap.source.js
 *   module.exports.getSitemapEntries = async () => {
 *     const products = await fetchAllProductsFromYourCatalogApi()
 *     return products.map((p) => ({ loc: `/products/${p.slug}`, lastmod: p.updatedAt }))
 *   }
 *
 * Each entry is either a path string or `{ loc, lastmod?, changefreq? }`. When
 * `seo.sitemap.source.js` exists, its entries are used INSTEAD OF `seo.config.json
 * .sitemapRoutes` (the config list stays as the static fallback for products that don't need
 * a dynamic source). This file is product-specific — not committed to MyRN itself.
 *
 * See `.docs/seo-standard.md` § "Applying SEO to a real e-commerce product" for the full guide.
 */

const fs = require('fs')
const path = require('path')

const root = process.cwd()
const config = require(path.join(root, 'seo.config.json'))
const publicDir = path.join(root, 'public')
const dynamicSourcePath = path.join(root, 'seo.sitemap.source.js')

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

function writeRobotsDisallow(reason) {
  const content = `User-agent: *\nDisallow: /\n`
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), content)
  console.log(`robots.txt: Disallow all (${reason}).`)
}

async function resolveSitemapEntries() {
  if (fs.existsSync(dynamicSourcePath)) {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const source = require(dynamicSourcePath)
    if (typeof source.getSitemapEntries !== 'function') {
      throw new Error('seo.sitemap.source.js must export an async function `getSitemapEntries()`.')
    }
    const entries = await source.getSitemapEntries()
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error('seo.sitemap.source.js getSitemapEntries() must return a non-empty array.')
    }
    return { entries, dynamic: true }
  }

  const routes =
    Array.isArray(config.sitemapRoutes) && config.sitemapRoutes.length > 0
      ? config.sitemapRoutes
      : ['/']
  return { entries: routes, dynamic: false }
}

function normalizeEntry(entry, siteUrl) {
  const raw = typeof entry === 'string' ? { loc: entry } : entry
  const loc = raw.loc.startsWith('http')
    ? raw.loc
    : `${siteUrl}${raw.loc.startsWith('/') ? raw.loc : `/${raw.loc}`}`
  return {
    loc,
    lastmod: raw.lastmod,
    changefreq: raw.changefreq || 'weekly',
  }
}

async function main() {
  if (!config.enabled) {
    writeRobotsDisallow('seo.config.json "enabled" is false')
    console.log('sitemap.xml: skipped (SEO disabled).')
    return
  }

  if (!config.indexable) {
    writeRobotsDisallow('seo.config.json "indexable" is false')
    console.log('sitemap.xml: skipped (not indexable).')
    return
  }

  if (!config.siteUrl) {
    console.error(
      'seo.config.json: "siteUrl" is required when "enabled" and "indexable" are both true.',
    )
    process.exitCode = 1
    return
  }

  const siteUrl = config.siteUrl.replace(/\/$/, '')

  const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent)
  console.log(`robots.txt: Allow all, sitemap -> ${siteUrl}/sitemap.xml`)

  const { entries: rawEntries, dynamic } = await resolveSitemapEntries()
  const entries = rawEntries.map((entry) => normalizeEntry(entry, siteUrl))

  const urlEntries = entries
    .map((entry) => {
      const lastmodTag = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
      return `  <url>\n    <loc>${entry.loc}</loc>${lastmodTag}\n    <changefreq>${entry.changefreq}</changefreq>\n  </url>`
    })
    .join('\n')

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent)
  console.log(
    `sitemap.xml: ${entries.length} route(s) written (${dynamic ? 'dynamic source' : 'static config'}).`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
