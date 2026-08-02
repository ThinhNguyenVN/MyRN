import { resolveWheelPickerEngine } from '@/components/elements/picker-engine/resolve-picker-engine'
import {
  commitWheelSelection,
  resolveIndexFromPickerSelection,
  resolvePendingIndex,
} from '@/components/elements/picker-engine/wheel-commit'

describe('resolveWheelPickerEngine', () => {
  it('uses expo-ui wheel on ios only', () => {
    expect(resolveWheelPickerEngine('ios')).toBe('expo-ui')
  })

  it('keeps custom wheel on android and web', () => {
    expect(resolveWheelPickerEngine('android')).toBe('custom')
    expect(resolveWheelPickerEngine('web')).toBe('custom')
  })
})

describe('resolvePendingIndex', () => {
  const items = [{ value: 'a' }, { value: 'b' }, { value: 'c' }]

  it('returns matching index', () => {
    expect(resolvePendingIndex('b', items)).toBe(1)
  })

  it('returns 0 for null/undefined or empty list', () => {
    expect(resolvePendingIndex(null, items)).toBe(0)
    expect(resolvePendingIndex(undefined, items)).toBe(0)
    expect(resolvePendingIndex('a', [])).toBe(0)
  })

  it('returns 0 when value is missing', () => {
    expect(resolvePendingIndex('missing', items)).toBe(0)
  })
})

describe('resolveIndexFromPickerSelection', () => {
  const items = [{ value: 1 }, { value: 2 }, { value: 3 }]

  it('prefers a valid itemIndex', () => {
    expect(resolveIndexFromPickerSelection('ignored', 1, items)).toBe(1)
  })

  it('matches string-tagged numeric values from SwiftUI', () => {
    expect(resolveIndexFromPickerSelection('2', -1, items)).toBe(1)
  })

  it('matches exact values', () => {
    expect(resolveIndexFromPickerSelection(3, -1, items)).toBe(2)
  })

  it('returns -1 when unresolved', () => {
    expect(resolveIndexFromPickerSelection('missing', -1, items)).toBe(-1)
  })
})

describe('commitWheelSelection', () => {
  const items = [{ value: 10 }, { value: 20 }, { value: 30 }]

  it('commits value at pending index', () => {
    expect(commitWheelSelection(items, 1)).toBe(20)
  })

  it('returns undefined for out-of-bounds or empty', () => {
    expect(commitWheelSelection(items, -1)).toBeUndefined()
    expect(commitWheelSelection(items, 99)).toBeUndefined()
    expect(commitWheelSelection([], 0)).toBeUndefined()
  })
})
