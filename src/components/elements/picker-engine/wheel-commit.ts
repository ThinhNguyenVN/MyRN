import { isNil } from 'lodash'

export function resolvePendingIndex(value: unknown, items: readonly { value: unknown }[]): number {
  if (isNil(value) || items.length === 0) return 0
  const idx = items.findIndex((item) => item.value === value)
  return idx >= 0 ? idx : 0
}

/**
 * Resolve wheel index from Expo UI / SwiftUI picker callbacks.
 * Native wheel tags values as strings, so number item values may arrive as `"3"`.
 */
export function resolveIndexFromPickerSelection(
  itemValue: unknown,
  itemIndex: number,
  items: readonly { value: unknown }[],
): number {
  if (itemIndex >= 0 && itemIndex < items.length) return itemIndex
  if (items.length === 0 || isNil(itemValue)) return -1
  const exact = items.findIndex((item) => item.value === itemValue)
  if (exact >= 0) return exact
  const coerced = items.findIndex((item) => String(item.value) === String(itemValue))
  return coerced
}

export function commitWheelSelection<T>(
  items: readonly { value: T }[],
  pendingIndex: number,
): T | undefined {
  if (items.length === 0) return undefined
  if (pendingIndex < 0 || pendingIndex >= items.length) return undefined
  return items[pendingIndex]?.value
}
