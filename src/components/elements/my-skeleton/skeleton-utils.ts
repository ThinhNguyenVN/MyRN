import type { MySkeletonPreset, SkeletonLayoutItem } from './type'

const LIST_ROW_LAYOUT: SkeletonLayoutItem[] = [
  { key: 'title', width: '92%', height: 16, marginBottom: 8 },
  { key: 'caption', width: '58%', height: 12 },
]

const TEXT_BLOCK_LAYOUT: SkeletonLayoutItem[] = [
  { key: 'line1', width: '100%', height: 14, marginBottom: 8 },
  { key: 'line2', width: '88%', height: 14, marginBottom: 8 },
  { key: 'line3', width: '72%', height: 14 },
]

const CARD_LAYOUT: SkeletonLayoutItem[] = [
  { key: 'media', width: '100%', height: 120, marginBottom: 12, borderRadius: 8 },
  { key: 'title', width: '70%', height: 16, marginBottom: 8 },
  { key: 'body', width: '92%', height: 12 },
]

export function getSkeletonLayout(preset: MySkeletonPreset): SkeletonLayoutItem[] {
  switch (preset) {
    case 'textBlock':
      return TEXT_BLOCK_LAYOUT
    case 'card':
      return CARD_LAYOUT
    case 'listRow':
    default:
      return LIST_ROW_LAYOUT
  }
}

export function resolveSkeletonCount(count: number | undefined): number {
  if (typeof count !== 'number' || count < 1) return 1
  return Math.floor(count)
}
