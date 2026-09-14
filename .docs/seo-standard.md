# SEO standard

How web SEO (title/meta/OG/JSON-LD/robots/sitemap) works in this template, how to turn
it on for a real product, and the gotchas that make this different from a normal
React/Next.js SEO setup. Read this whenever a task mentions SEO, meta tags, Open Graph,
social link preview, robots.txt, sitemap, or search indexing.

## Why this exists

This template can become a public marketing site, an internal admin tool, or a
mobile-only app. SEO is **opt-in and off by default** so it never affects products that
don't need it (see "Native / non-web impact" below).

## What is already shipped (baseline)

- `seo.config.json` (repo root) — the single config file that drives everything below.
- `src/components/ui/site-seo/` (`SiteSeo` component) — renders site-wide `<title>`,
  meta description/keywords, `theme-color`, canonical, Open Graph, Twitter card, and an
  optional `Organization` JSON-LD block, all read from `seo.config.json`.
- `src/app/+html.tsx` — sets `<html lang>` from `seo.config.json.lang`.
- `src/app/_layout.tsx` — mounts `<SiteSeo />` unconditionally, **outside**
  `AppInitGate` (see "The AppInitGate gotcha" below — this placement is required, not
  a style choice).
- `scripts/generate-seo-files.js` (`yarn seo:generate`) — generates
  `public/robots.txt` and `public/sitemap.xml` from `seo.config.json`. Not wired into
  `postinstall`; run it manually (or in a web deploy pipeline) before
  `expo export --platform web` whenever `seo.config.json` changes.
- `public/og-image.jpg` — a neutral placeholder (1200x630). Replace it with a real
  share image before enabling SEO for a product.

## How to enable SEO for a real product

1. Confirm the production web domain with the human — do not guess it.
2. Edit `seo.config.json`:
   - `enabled: true`
   - `indexable: true` (keep `false` for a staging/preview deploy you don't want
     indexed yet — `SiteSeo` still renders full OG/JSON-LD but adds
     `<meta name="robots" content="noindex, nofollow">`, and the generated
     `robots.txt` still disallows everything)
   - `siteUrl`, `lang`, `locale`, `defaultTitle`, `defaultDescription`,
     `defaultKeywords`, `themeColor`
   - `organization` block if the product is a real business (renders JSON-LD)
   - `sitemapRoutes`: list the public route paths that should be indexed
3. Replace `public/og-image.jpg` with a real 1200x630 share image.
4. Run `yarn seo:generate` to (re)write `public/robots.txt` / `public/sitemap.xml`.
5. Verify with a real export — do not just trust the code:
   ```
   npx dotenv -e .env.test -- npx expo export --platform web
   ```
   Then inspect `dist/index.html` (or whichever route file) directly — grep for
   `<title`, `og:`, `twitter:`, `ld+json`, `<html lang` — and confirm
   `dist/robots.txt` / `dist/sitemap.xml` / `dist/og-image.jpg` exist. Do not report
   SEO as "done" from reading the component code alone — the AppInitGate gotcha below
   has silently broken this before.
6. Keep `specs/<name>.spec.md` updated with the SEO scope/AC for that product
   (`specs/_template.spec.md`), same as any other product feature.

## Per-page title/description overrides

`SiteSeo` sets the **site-wide default**. A screen that wants its own title/description
renders its own `<Head>` (from `expo-router/head`) with just those tags:

```tsx
import Head from 'expo-router/head'

<Head>
  <title>Pricing – {config.defaultTitle}</title>
  <meta name="description" content="..." />
</Head>
```

`Head` is `react-helmet-async` under the hood: same-key tags (`title`, `meta[name=...]`)
merge by last-rendered-wins, so this cleanly overrides just those two tags while
everything else from `SiteSeo` (OG image, JSON-LD, theme-color) stays inherited.

**Limitation, not a bug**: that per-screen `<Head>` lives inside the screen component,
which renders inside `AppInitGate` — so during `expo export --platform web` it is
**absent from the static HTML** for that route (see next section). It only takes effect
after the client hydrates. Googlebot (executes JS) still sees it; a non-JS crawler or
social-preview bot hitting that specific inner page URL directly will only see the
`SiteSeo` site-wide default, not the per-page override. This is acceptable for most
products (Google still gets the real per-page title), but call it out explicitly if a
product's AC requires accurate social previews for deep links to non-landing pages —
that needs the SSR follow-up below.

## The AppInitGate gotcha (read this before touching SEO code)

`RootLayout` wraps the app in `AppInitGate`, which returns `null` until `useAppInit`
resolves inside a `useEffect` (font loading + a fixed delay). `useEffect` **does not run**
during `expo export`'s static server-render pass. So anything mounted *inside*
`AppInitGate` — including a `<Head>` — is **completely absent** from the exported static
HTML, not just the visible body. This was verified directly (not assumed): moving
`SiteSeo` inside a gated screen produced an empty `<title>` and zero meta tags in
`dist/*.html`; moving it above `AppInitGate` in `RootLayout` fixed it.

**Rule: any component that needs to appear in the static-exported `<head>` (title, meta,
JSON-LD, `<html>` attributes) must be mounted outside `AppInitGate`, or set via
`+html.tsx` (which runs in Node before the gate even exists).** `SiteSeo` already
follows this rule — do not move it inside `AppInitGate` or inside a feature screen.

## `<html lang>` — set via `+html.tsx`, not via `<Head>`

Setting `<html lang="...">` through `<Head>` produced a **duplicate** `lang` attribute
in the exported HTML (`<html lang="vi" lang="en">`) instead of replacing the default
`lang="en"` from Expo's built-in web template. `src/app/+html.tsx` is the officially
supported way to customize the root HTML document (see
[Expo docs](https://docs.expo.dev/router/reference/static-rendering/#root-html)) and is
the single source of truth for `lang` here — do not also set `<html lang>` from
`SiteSeo`.

## Native / non-web impact

Verified directly in `expo-router`'s source (`ExpoHead.android.js`,
`ExpoHead.ios.js`), not assumed:

- **Android**: `Head` is a hardcoded no-op (`return null`).
- **iOS**: `Head` is a no-op unless the app is a bare/custom-dev-client build with the
  native Handoff/Spotlight module linked — and even then it only registers OS-level
  search metadata, no UI/layout impact.
- `+html.tsx` is a web-only special file — it runs in Node during static export and is
  never bundled into a native build.
- `public/robots.txt`, `sitemap.xml`, `og-image.jpg` are only copied into `dist/` on
  `expo export --platform web` — irrelevant to native builds.
- `react-helmet-async` (what `Head` uses on web) is vendored **inside** `expo-router`
  itself — enabling SEO adds no new dependency and no native/mobile bundle size cost.

So a mobile-only product can leave `seo.config.json` untouched (`enabled: false`) and
this feature has zero effect on it.

## Admin / internal web tools

If the product exports to web but should **not** be publicly indexed (an admin
dashboard, an internal tool), keep `indexable: false` (or `enabled: false` entirely if
it needs no OG/meta at all). Do not flip `indexable: true` just because the product
happens to be a web app — only do it for a public, marketing-facing site, and confirm
with the human first if unsure.

## Applying SEO to a real e-commerce product (checklist)

MyRN itself has no catalog, no real domain, no real product images — it's a platform, not a
product. What MyRN ships is a set of **generic, product-agnostic building blocks** for the SEO
work every e-commerce product built on this template will need. This section is the checklist
for wiring them up once a real product exists. Do not build catalog-specific logic into MyRN
itself — that belongs in the product's `src/features/<domain>`.

Read this whenever asked to "add SEO" / "apply SEO" to a product screen (PDP, category listing,
search results) — not just when the word "SEO" appears, since the request is usually phrased as
"make this product page rank well" or "add structured data".

### What already exists (platform-level, use as-is)

| Piece | File | Purpose |
|---|---|---|
| `buildProductJsonLd(input)`, `buildBreadcrumbJsonLd(items)` | `src/utils/product-json-ld.ts` | Pure functions: product data in, schema.org `Product`/`Offer`/`AggregateRating`/`BreadcrumbList` JSON-LD out. |
| `<JsonLd data={...} />` | `src/components/ui/site-seo/json-ld.tsx` | Renders one `<script type="application/ld+json">` via `expo-router/head`. |
| `useCanonicalUrl(allowedParams?)`, `<FilterPageSeo allowedParams={...} />` | `src/hooks/use-canonical-url.ts`, `src/components/ui/site-seo/filter-page-seo.tsx` | Canonical URL + `noindex` for filterable/faceted list pages (category with color/size/sort query params, search results). |
| `getOptimizedImageUrl(url, opts)` | `src/utils/image-cdn.ts` | Resize/format hook point for product images. Pass-through no-op until a provider is configured. |
| `IMAGE_CDN_PROVIDER` | `src/configs/image-cdn.config.ts` | Single override point (same pattern as `brand.config.ts`) — set this once when a product picks a real image CDN. |
| Dynamic sitemap source | `scripts/generate-seo-files.js` (reads optional `seo.sitemap.source.js`) | Lets a product feed real catalog routes into the sitemap instead of the static `seo.config.json.sitemapRoutes` list. |

### Checklist: turning these on for a real product

1. **Product JSON-LD**: in the PDP screen's view, map the product API response into
   `ProductJsonLdInput` and render `<JsonLd data={buildProductJsonLd(input)} />`. For a category/
   listing page with breadcrumbs, render `<JsonLd data={buildBreadcrumbJsonLd(items)} />` too.
   Do this in the screen's `view`, not in `src/utils` — the utils stay data-agnostic.
2. **Canonical + noindex for filters**: in any list/category/search screen reachable with filter
   query params, render `<FilterPageSeo allowedParams={['page']} />` (adjust `allowedParams` to
   whatever your pagination/sort param actually is — everything else present is treated as a
   filter and triggers `noindex`).
3. **Dynamic sitemap**: create `seo.sitemap.source.js` at the repo root (product-specific, not
   committed to MyRN) exporting `getSitemapEntries()` that calls the product's real catalog API
   and returns `{ loc, lastmod? }` entries. Run `yarn seo:generate` (or wire it into the web
   deploy pipeline) — it will use this file automatically when present, falling back to the
   static `sitemapRoutes` list otherwise. For a catalog past roughly 50k URLs, split into
   multiple sitemap files + a sitemap index — not implemented here, out of scope until a product
   actually needs it.
4. **Image optimization**: pick an image CDN/provider (Cloudinary, imgix, Bunny, Cloudflare
   Images, or the backend's own resizing endpoint if it has one) and implement
   `IMAGE_CDN_PROVIDER` in `src/configs/image-cdn.config.ts` (an example Cloudinary shape is
   already commented there). Then route product image URLs through
   `getOptimizedImageUrl(url, { width })` wherever they render (product cards, PDP gallery,
   `MyImage` usages for catalog images) instead of using the raw URL directly.
5. **Base meta/OG/sitemap config**: still follow "How to enable SEO for a real product" above
   (`seo.config.json`, real `og-image.jpg`, confirm the domain with the human) — the checklist
   here is additive on top of that, specific to product *content* (JSON-LD, dynamic routes,
   images), not the site-wide defaults.
6. **Verify with a real export**, same rule as the rest of this doc: run `expo export
   --platform web`, inspect the emitted HTML/`sitemap.xml`/`robots.txt` directly. Do not report
   this as done from reading the component code alone.
7. Update `specs/<name>.spec.md` with the SEO scope/AC, same as any other product feature
   (`.docs/product-kickoff.md`).

### What NOT to do

- Do not hardcode a product's catalog shape into `src/utils/product-json-ld.ts` — if a field is
  missing for your product, extend `ProductJsonLdInput`'s optional fields, don't fork the file.
- Do not add `seo.sitemap.source.js` to MyRN itself — it's a product-root file, gitignored or
  product-repo-only.
- Do not skip `FilterPageSeo` on a filterable list page "because it's not launched yet" — a
  crawlable staging/preview site with unindexed filter combinations already live is exactly the
  duplicate-content problem this exists to prevent.

## Known follow-up (not implemented here): SSR for real content

Static export (`web.output: "static"`) pre-renders each route to its own HTML file, but
because of the `AppInitGate` gotcha above, the actual body content (whatever the screen
renders) is only present after client hydration — a non-JS crawler sees the `SiteSeo`
head tags but an empty body. This is fine while a product's content is static
placeholder data. Once a product's screens render real/dynamic data that needs to be
crawlable in the initial HTML response (not just the `<head>`), switch `web.output` to
`"server"` (Expo Router server rendering) instead of working around `AppInitGate`
further. Treat this as a distinct, larger change — scope-lock it — do not attempt it as
a side effect of an unrelated SEO task.
