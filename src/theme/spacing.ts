export const Spacing = {
  x1: 4,
  x2: 8,
  x3: 12,
  x4: 16,
  x5: 20,
  x6: 24,
  x8: 32,
  x10: 40,
  x12: 48,
  x14: 56,
} as const

export type SpacingType = keyof typeof Spacing

export function getSpacing(spacing?: SpacingType) {
  if (!spacing) return 0
  return Spacing[spacing]
}
