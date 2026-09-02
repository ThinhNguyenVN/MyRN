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
