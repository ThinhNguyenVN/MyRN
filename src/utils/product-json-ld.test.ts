import { buildBreadcrumbJsonLd, buildProductJsonLd } from './product-json-ld'

describe('buildProductJsonLd', () => {
  const baseInput = {
    url: 'https://example.com/products/ao-thun',
    name: 'Áo thun basic',
    imageUrls: ['https://example.com/img/ao-thun-1.jpg'],
    price: 199000,
    priceCurrency: 'VND',
  }

  it('builds a Product + Offer node with required fields', () => {
    const result = buildProductJsonLd(baseInput)

    expect(result['@type']).toBe('Product')
    expect(result.name).toBe(baseInput.name)
    expect(result.image).toEqual(baseInput.imageUrls)
    expect(result.offers).toMatchObject({
      '@type': 'Offer',
      price: baseInput.price,
      priceCurrency: baseInput.priceCurrency,
      availability: 'https://schema.org/InStock',
    })
  })

  it('respects an explicit availability', () => {
    const result = buildProductJsonLd({ ...baseInput, availability: 'OutOfStock' })
    expect((result.offers as Record<string, unknown>).availability).toBe(
      'https://schema.org/OutOfStock',
    )
  })

  it('omits aggregateRating when no rating data is given', () => {
    const result = buildProductJsonLd(baseInput)
    expect(result.aggregateRating).toBeUndefined()
  })

  it('includes aggregateRating only when both ratingValue and reviewCount are given', () => {
    const result = buildProductJsonLd({ ...baseInput, ratingValue: 4.5, reviewCount: 120 })
    expect(result.aggregateRating).toMatchObject({
      '@type': 'AggregateRating',
      ratingValue: 4.5,
      reviewCount: 120,
    })
  })

  it('includes brand only when provided', () => {
    const withoutBrand = buildProductJsonLd(baseInput)
    expect(withoutBrand.brand).toBeUndefined()

    const withBrand = buildProductJsonLd({ ...baseInput, brand: 'MyRN' })
    expect(withBrand.brand).toEqual({ '@type': 'Brand', name: 'MyRN' })
  })
})

describe('buildBreadcrumbJsonLd', () => {
  it('builds a BreadcrumbList with 1-based positions in order', () => {
    const result = buildBreadcrumbJsonLd([
      { name: 'Trang chủ', url: 'https://example.com' },
      { name: 'Áo', url: 'https://example.com/ao' },
      { name: 'Áo thun basic', url: 'https://example.com/products/ao-thun' },
    ])

    expect(result['@type']).toBe('BreadcrumbList')
    const items = result.itemListElement as Array<Record<string, unknown>>
    expect(items).toHaveLength(3)
    expect(items[0]).toMatchObject({ '@type': 'ListItem', position: 1, name: 'Trang chủ' })
    expect(items[2]).toMatchObject({ position: 3, name: 'Áo thun basic' })
  })
})
