/**
 * Fake, hardcoded "build-time data source" for the `generateStaticParams()` demo route
 * (`[slug].tsx` in this folder). A real product fork replaces this file's implementation
 * (e.g. read a JSON file generated from the CMS/API before `expo export`, or call the
 * catalog API directly here — `generateStaticParams()` runs in Node at build time and can
 * do real I/O) while keeping the same two exports, so the route file itself never changes.
 * See `.docs/seo-standard.md` § "Dynamic public routes: generateStaticParams()".
 */

export interface DemoItem {
  slug: string
  name: string
  description: string
  price: number
  imageUrl: string
}

const DEMO_ITEMS: DemoItem[] = [
  {
    slug: 'reference-item-one',
    name: 'Reference Item One',
    description: 'First demo item proving generateStaticParams() produces real, crawlable HTML per slug.',
    price: 19.99,
    imageUrl: 'https://example.com/reference-item-one.jpg',
  },
  {
    slug: 'reference-item-two',
    name: 'Reference Item Two',
    description: 'Second demo item — confirms multiple params each get their own generated HTML file.',
    price: 29.99,
    imageUrl: 'https://example.com/reference-item-two.jpg',
  },
]

export async function getAllDemoSlugs(): Promise<string[]> {
  return DEMO_ITEMS.map((item) => item.slug)
}

export function getDemoItemBySlug(slug: string | undefined): DemoItem | undefined {
  return DEMO_ITEMS.find((item) => item.slug === slug)
}
