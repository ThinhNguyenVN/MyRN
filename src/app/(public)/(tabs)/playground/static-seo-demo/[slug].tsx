import Head from 'expo-router/head'
import { useLocalSearchParams } from 'expo-router'

import MyText from '@/components/elements/my-text'
import MyView from '@/components/elements/my-view'
import { JsonLd } from '@/components/ui/site-seo'
import { buildProductJsonLd } from '@/utils/product-json-ld'

import { getAllDemoSlugs, getDemoItemBySlug } from '@/features/playground/static-seo-demo/data'

/**
 * Reference implementation for a dynamic public SEO route rendered by
 * `generateStaticParams()` — no `web.output: "server"`, no `unstable_useServerRendering`
 * flag. Copy this file's shape for a real product's PDP-style route; see
 * `.docs/seo-standard.md` § "Dynamic public routes: generateStaticParams()" for the full
 * writeup.
 *
 * Proof this actually works (not just plausible-looking code) — run:
 *   npx dotenv -e .env.test -- npx expo export --platform web
 * then inspect the generated file for one slug, e.g.:
 *   cat "dist/(public)/(tabs)/playground/static-seo-demo/reference-item-one.html"
 * and confirm it contains (before any JS runs): <title>, <meta name="description">,
 * <link rel="canonical">, og:*, a <script type="application/ld+json"> Product block, and
 * the item name/description/price rendered as real body text.
 */

// Server-only — evaluated in Node at `expo export` time. No browser/native APIs here.
export async function generateStaticParams() {
  const slugs = await getAllDemoSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default function StaticSeoDemoScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  // Synchronous, build-time lookup — no useEffect, no RTK Query hook. This is what makes
  // the content present in the static-exported HTML instead of only after hydration.
  const item = getDemoItemBySlug(slug)

  if (!item) {
    return (
      <MyView>
        <MyText typography="body">Not found: {slug}</MyText>
      </MyView>
    )
  }

  const canonicalUrl = `https://example.com/playground/static-seo-demo/${item.slug}`

  return (
    <MyView>
      <Head>
        <title>{item.name}</title>
        <meta name="description" content={item.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={item.name} />
        <meta property="og:description" content={item.description} />
        <meta property="og:image" content={item.imageUrl} />
      </Head>
      <JsonLd
        data={buildProductJsonLd({
          url: canonicalUrl,
          name: item.name,
          description: item.description,
          imageUrls: [item.imageUrl],
          price: item.price,
          priceCurrency: 'USD',
        })}
      />
      <MyText typography="subtitle">{item.name}</MyText>
      <MyText typography="body">{item.description}</MyText>
      <MyText typography="body">${item.price.toFixed(2)}</MyText>
    </MyView>
  )
}
