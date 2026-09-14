/**
 * Image optimization abstraction (resize/format via a CDN), the platform-level counterpart of
 * `next/image` for this repo. Default behaviour is a pass-through no-op — a product wires a
 * real provider via `src/configs/image-cdn.config.ts` (single override point, same pattern as
 * `src/configs/brand.config.ts`). See `.docs/seo-standard.md` § "Applying SEO to a real
 * e-commerce product" for how to plug in a real CDN.
 */

import { IMAGE_CDN_PROVIDER } from '@/configs/image-cdn.config'

export interface ImageOptimizeOptions {
  width?: number
  height?: number
  /** 1-100. */
  quality?: number
}

export type ImageCdnProvider = (url: string, opts: ImageOptimizeOptions) => string

/**
 * Returns an optimized URL for `url` (resize/format via whatever `IMAGE_CDN_PROVIDER` is
 * configured). With no provider configured (the default), returns `url` unchanged — safe to
 * call everywhere product images render, even before a real CDN is chosen.
 */
export function getOptimizedImageUrl(url: string, opts: ImageOptimizeOptions = {}): string {
  if (!url) return url
  if (!IMAGE_CDN_PROVIDER) return url
  return IMAGE_CDN_PROVIDER(url, opts)
}
