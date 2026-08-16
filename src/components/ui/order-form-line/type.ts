import type { DropdownOption } from '@/components/elements/my-dropdown-input/type'

/** Minimal catalog row used to default unit when the product changes. */
export type OrderFormLineCatalogItem = {
  id: string
  unit_id?: string | null
}

export type OrderFormLineProductChange = {
  productId: string
  product: OrderFormLineCatalogItem | undefined
  productChanged: boolean
  isInitial: boolean
}

export type OrderFormLineEditorProps = {
  index: number
  productOptions: DropdownOption[]
  unitOptions: DropdownOption[]
  products: OrderFormLineCatalogItem[]
  disabled: boolean
  compact: boolean
  canRemove: boolean
  isLast: boolean
  onRemove: (index: number) => void
  isProductsLoading: boolean
  isUnitsLoading: boolean
  /** Re-run product sync when this changes (e.g. price type). */
  syncKey?: string
  onProductChange?: (change: OrderFormLineProductChange) => void
}

export type OrderFormLineNoteProps = {
  index: number
  disabled: boolean
}

export type OrderProductThumbProps = {
  imageUrl?: string | null
}
