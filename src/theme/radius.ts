export const Radius = {
  small: 6,
  medium: 10,
  large: 14,
  full: 999,
  none: 0,
} as const

export type RadiusType = keyof typeof Radius
