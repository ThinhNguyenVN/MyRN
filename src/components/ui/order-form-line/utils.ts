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
