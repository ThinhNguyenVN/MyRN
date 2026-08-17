/**
 * Server reuses the same storage path after upload and often does **not** bump
 * `updated` (live probe). Keep a session map so list/detail thumbs can bust
 * expo-image cache even when the API URL + updated stay identical.
 */
const imageVersions = new Map<string, number>()

export function bumpProductImageVersion(productId: string): number {
  const next = Date.now()
  imageVersions.set(productId, next)
  return next
}

export function getProductImageVersion(productId: string): number | undefined {
  return imageVersions.get(productId)
}

/**
 * Display URL for product images. Prefer client bump (after upload), else `updated`.
 */
export function productImageDisplayUrl(
  image: string | null | undefined,
  updated?: string | null,
  productId?: string | null,
): string | null {
  if (!image) {
    return null
  }
  const base = image.split('?')[0]
  const version =
    (productId ? getProductImageVersion(productId) : undefined) ??
    (updated && updated !== '0000-00-00 00:00:00' ? updated : undefined)
  if (version === undefined || version === null || version === '') {
    return base
  }
  return `${base}?v=${encodeURIComponent(String(version))}`
}
