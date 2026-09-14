/**
 * Framework-agnostic schema.org JSON-LD builders for product content SEO.
 *
 * These are pure functions: they take a plain input object and return a plain JSON-LD
 * object. They don't know or care where the data comes from — a product feature maps its
 * own catalog/API response shape into `ProductJsonLdInput`/`BreadcrumbItem[]` and renders
 * the result via `<JsonLd data={...} />` (see `src/components/ui/site-seo/json-ld.tsx`).
 *
 * See `.docs/seo-standard.md` § "Applying SEO to a real e-commerce product" for the full
 * usage guide.
 */

export type ProductAvailability = 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder'

export interface ProductJsonLdInput {
  /** Canonical absolute URL of the product page. */
  url: string
  name: string
  description?: string
  /** Absolute image URLs, at least one. */
  imageUrls: string[]
  sku?: string
  brand?: string
  price: number
  /** ISO 4217 currency code, e.g. "VND", "USD". */
  priceCurrency: string
  /** @default 'InStock' */
  availability?: ProductAvailability
  /** 1-5 average rating. Omit `ratingValue`/`reviewCount` entirely when there are no reviews yet. */
  ratingValue?: number
  reviewCount?: number
}

export interface BreadcrumbItem {
  name: string
  /** Absolute URL of this breadcrumb step. */
  url: string
}

export function buildProductJsonLd(input: ProductJsonLdInput): Record<string, unknown> {
  const availability = input.availability ?? 'InStock'

  const offers: Record<string, unknown> = {
    '@type': 'Offer',
    url: input.url,
    price: input.price,
    priceCurrency: input.priceCurrency,
    availability: `https://schema.org/${availability}`,
  }

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    url: input.url,
    image: input.imageUrls,
    description: input.description || undefined,
    sku: input.sku || undefined,
    brand: input.brand ? { '@type': 'Brand', name: input.brand } : undefined,
    offers,
  }

  if (typeof input.ratingValue === 'number' && typeof input.reviewCount === 'number') {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.ratingValue,
      reviewCount: input.reviewCount,
    }
  }

  return jsonLd
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
