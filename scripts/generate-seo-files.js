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
 * See `.docs/seo-standard.md` for the full config reference.
 */

const fs = require('fs')
const path = require('path')

const root = process.cwd()
const config = require(path.join(root, 'seo.config.json'))
const publicDir = path.join(root, 'public')

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

function writeRobotsDisallow(reason) {
  const content = `User-agent: *\nDisallow: /\n`
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), content)
  console.log(`robots.txt: Disallow all (${reason}).`)
}

if (!config.enabled) {
  writeRobotsDisallow('seo.config.json "enabled" is false')
  console.log('sitemap.xml: skipped (SEO disabled).')
  process.exit(0)
}

if (!config.indexable) {
  writeRobotsDisallow('seo.config.json "indexable" is false')
  console.log('sitemap.xml: skipped (not indexable).')
  process.exit(0)
}

if (!config.siteUrl) {
  console.error(
    'seo.config.json: "siteUrl" is required when "enabled" and "indexable" are both true.',
  )
  process.exit(1)
}

const siteUrl = config.siteUrl.replace(/\/$/, '')

const robotsContent = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsContent)
console.log(`robots.txt: Allow all, sitemap -> ${siteUrl}/sitemap.xml`)

const routes = Array.isArray(config.sitemapRoutes) && config.sitemapRoutes.length > 0
  ? config.sitemapRoutes
  : ['/']

const urlEntries = routes
  .map((route) => {
    const loc = route.startsWith('http') ? route : `${siteUrl}${route.startsWith('/') ? route : `/${route}`}`
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`
  })
  .join('\n')

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent)
console.log(`sitemap.xml: ${routes.length} route(s) written.`)
