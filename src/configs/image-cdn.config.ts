import type { ImageCdnProvider } from '@/utils/image-cdn'

/**
 * Product override point for image optimization. `null` (default) = pass-through: product
 * images render at their original URL, unresized. When a real product needs responsive/
 * next-gen-format product images (almost always true for an e-commerce catalog), set this to
 * a real provider function. Example (Cloudinary fetch/URL-transform pattern — adjust to your
 * account's actual delivery URL shape):
 *
 * ```ts
 * export const IMAGE_CDN_PROVIDER: ImageCdnProvider = (url, { width, quality = 75 }) => {
 *   const transforms = [width ? `w_${width}` : null, `q_${quality}`, 'f_auto'].filter(Boolean)
 *   return `https://res.cloudinary.com/<cloud-name>/image/fetch/${transforms.join(',')}/${encodeURIComponent(url)}`
 * }
 * ```
 *
 * See `.docs/seo-standard.md` § "Applying SEO to a real e-commerce product".
 */
export const IMAGE_CDN_PROVIDER: ImageCdnProvider | null = null
