import { productImageDisplayUrl } from '@/utils/product-image-url'

import type { DropdownOption } from '@/components/elements/my-dropdown-input/type'

export function orderLineTotal(
  quantity: string | number | null | undefined,
  unitPrice: string | number | null | undefined,
): number {
  const qty = typeof quantity === 'number' ? quantity : Number(quantity)
  const price = typeof unitPrice === 'number' ? unitPrice : Number(unitPrice)
  const safeQty = Number.isFinite(qty) ? qty : 0
  const safePrice = Number.isFinite(price) ? price : 0
  return safeQty * safePrice
}

/**
 * `toProductOptions` (outbound/inbound `utils.ts`) only lists active products, so a line
 * referencing a product that was discontinued after the order was created has no matching
 * option and the dropdown shows blank instead of its real name. Add one fallback option per
 * otherwise-unmatched line, sourced from the order's own `product_name` (which the detail API
 * already returns regardless of the product's current active state).
 */
export function withOrderLineProductOptions(
  baseOptions: DropdownOption[],
  lines:
    | { product_id: string; product_name: string; sku: string; thumbnail?: string | null }[]
    | undefined,
): DropdownOption[] {
  const known = new Set(baseOptions.map((option) => option.value))
  const extras: DropdownOption[] = []
  for (const line of lines ?? []) {
    if (!line.product_id || known.has(line.product_id)) {
      continue
    }
    known.add(line.product_id)
    extras.push({
      label: line.sku ? `${line.product_name} (${line.sku})` : line.product_name,
      value: line.product_id,
      imageUrl: productImageDisplayUrl(line.thumbnail, undefined, line.product_id),
    })
  }
  return extras.length > 0 ? [...baseOptions, ...extras] : baseOptions
}
