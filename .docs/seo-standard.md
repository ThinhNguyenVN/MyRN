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

**`(public)` routes on web**: this per-screen `<Head>` (and the screen's actual body
content) *is* present in the static HTML `expo export --platform web` generates — see
"The AppInitGate gotcha" below for why. Verified directly by inspecting `dist/*.html`.

**`(private)` routes on web**: still absent from the static HTML — `(private)/_layout.tsx`
intentionally keeps its own gate (waits for auth restore before deciding whether to
redirect to login), so nothing under it renders during the static prerender pass. This
is fine: protected routes aren't meant to be crawled/indexed anyway.

**Native**: `Head` is a no-op either way (see "Native / non-web impact" below), so this
distinction only matters for web.

## The AppInitGate gotcha (read this before touching SEO code)

`RootLayout` (`src/app/_layout.tsx`) waits on `useAppInit()` (font loading, auth restore,
locale hydrate, a notifications delay) before it's `isInitialized`. That flag only ever
flips to `true` inside a `useEffect`, and `useEffect` **does not run** during `expo
export`'s static prerender pass — so anything that only renders once `isInitialized` is
`true` is **completely absent** from the exported static HTML, not just visually hidden.
This was verified directly (not assumed): with the old blanket gate, moving `SiteSeo`
inside it produced an empty `<title>` and zero meta tags, and screen bodies rendered
empty, in `dist/*.html`.

**Fixed for `(public)` web routes (2026-09-14)**: `AppInitGate` in `_layout.tsx` no
longer blocks on web — it only still blocks on native (`if (!isInitialized && !isWeb)
return null`). So on web, the whole `(public)` route tree — screen body content, per-
screen `<Head>` overrides, `<JsonLd>`, `<FilterPageSeo>` — renders immediately and *is*
present in the static-exported HTML, without waiting for hydration. Auth/fonts/locale
still resolve progressively after hydration via the same `useAppInit()` call; there's a
brief window on web where content renders with default locale/system font before those
settle — acceptable for a public/marketing/catalog surface.

`(private)/_layout.tsx` intentionally keeps its own gate — it reads `isInitialized` via
`useAppInitState()` (a context `RootLayout` provides, so `useAppInit()`'s async tasks
don't run a second time) and still waits before deciding whether to `<Redirect>` to
login. This avoids Redux's `isAuthenticated` initial value (`false`) bouncing an
already-signed-in user to `/login` for a moment. Protected routes aren't meant to be
crawled anyway, so this doesn't affect SEO.

**Rule: any component that needs to appear in the static-exported `<head>` or body for a
`(public)` route just needs to render normally now** — no special placement required
beyond staying inside `(public)`. `SiteSeo` still renders above `AppInitGate` entirely
(covers `(private)` and native too, where the per-route content itself is still gated).
`+html.tsx` remains the way to set attributes on `<html>` itself (see next section).

## The silent Suspense hang: hooks that need `<Provider>` must run inside it

A second, independent bug was found (and fixed) while verifying the `AppInitGate`
change above by actually inspecting `dist/*.html`: **every** static-exported page —
not just `(public)` routes — had an empty `<title>` and a `#root` div containing only
`<!--$!--><template></template><!--/$-->` (React's "this Suspense boundary is still
pending" marker), with no error printed anywhere.

Root cause: `RootLayout` called `useAppInit()` directly, and `useAppInit()` calls
`useInitAuth()`, which calls `useAppDispatch()` (`react-redux`'s `useDispatch`).
`RootLayout` renders `<Provider store={store}>` **as a child of itself**, so
`RootLayout` is not a descendant of `Provider` — any Redux hook it calls has no
Provider ancestor. On web this doesn't throw a catchable error; `expo export`'s
synchronous `ReactDOMServer.renderToString` pass just treats the whole render as
permanently suspended and silently emits the fallback markers above for **every**
route, regardless of that route's own content. This is why the very first fix attempt
above (`AppInitGate` no longer blocking on web) alone did not fix the empty HTML — it
fixed a real, separate problem, but this second one was hiding underneath it.

**Fix**: moved `useAppInit()` out of `RootLayout` into a small inner component,
`AppInitBridge`, rendered *inside* `<Provider store={store}>` (still outside nothing
else changes — `AppInitProvider`/`AppInitGate` are rendered by `AppInitBridge` now,
not by `RootLayout` directly). Any future hook added to `useAppInit()` (or anything
else needing Redux/React context that's provided inside `RootLayout`'s own returned
tree) must go through `AppInitBridge` or a similarly-nested component — never be
called directly in `RootLayout`'s function body.

**General rule**: a component can only use a Context/Provider that is an *ancestor* of
it in the actual rendered tree. Rendering `<Provider>` as your own child does not make
your own hook calls descendants of it. This is easy to get wrong when refactoring
`_layout.tsx` and, on web static export specifically, fails **silently** (no thrown
error, just a permanently pending Suspense boundary) — so this class of bug will not
show up as a build error or a console warning; it only shows up as empty generated
HTML, which is exactly why the verification step (actually building and inspecting
`dist/*.html`) is mandatory and not optional.

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

## Dynamic public routes: `generateStaticParams()` (build-time data, no SSR)

For a route like `src/app/(public)/(tabs)/products/[slug].tsx` where the data changes
rarely (a demo catalog, a content site) and doesn't need to be correct in real time,
`web.output: "static"` can still generate one real HTML file per item at build time —
no `web.output: "server"`, no experimental flag. This is the recommended default for
this reason: Expo Router's server-only alternatives for this (`generateMetadata`,
`createStaticLoader`) both require `unstable_useServerRendering: true` even under
`"static"` output — still the alpha server-rendering machinery this template avoids.
Use plain `<Head>` (as in the rest of this doc) plus a synchronous, build-time data
lookup instead:

```tsx
// src/app/(public)/(tabs)/products/[slug].tsx
import Head from 'expo-router/head'
import { useLocalSearchParams } from 'expo-router'

import { JsonLd } from '@/components/ui/site-seo'
import { buildProductJsonLd } from '@/utils/product-json-ld'
import { getAllProductSlugs, getProductBySlug } from './products.data'

// Server-only, evaluated in Node at `expo export` time — no browser/native APIs here.
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default function ProductPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  // Synchronous — no useEffect/RTK Query hook. Product forks swap this module's
  // implementation (e.g. read a JSON file generated from the CMS/API before build)
  // for their real data source; the route file itself doesn't change.
  const product = getProductBySlug(slug)
  if (!product) return null

  return (
    <>
      <Head>
        <title>{product.name}</title>
        <meta name="description" content={product.description} />
      </Head>
      <JsonLd data={buildProductJsonLd(product)} />
      {/* main content — renders directly, not behind any RTK Query/useEffect fetch */}
    </>
  )
}
```

A worked, runnable example of this exact pattern lives at
`src/app/(public)/(tabs)/playground/static-seo-demo/[slug].tsx` (route file) +
`src/features/playground/static-seo-demo/data.ts` (the swappable build-time data source —
kept outside `src/app` so Expo Router doesn't try to treat it as its own route) — copy
this shape for a real dynamic route rather than starting from scratch. Its generated HTML was inspected directly after `expo export
--platform web` to confirm title/description/canonical/OG/JSON-LD/body content are all
present pre-hydration (see that route's file header comment for the exact commands).

**When this isn't enough — realtime/personalized data needing SSR**: if a product's
public content genuinely changes faster than a rebuild/redeploy cycle can track (live
inventory/pricing shown to crawlers, per-user personalization that must be correct on
first paint), `generateStaticParams` can't help — that needs `web.output: "server"`
(Expo Router server rendering, still alpha) and the RTK-Query-hook-vs-loader rework
described in `expo-ssr-gap-analysis.md` (project doc). Treat that as a distinct, larger
change — scope-lock it — do not reach for it by default; most product catalogs (demo or
real, rebuilt on every content change) are served fine by `generateStaticParams` alone.
