// =============================
// Elevation Token
// Types: Strength, Direction, Size
// Token format: strength | "strength/direction" | "strength/direction/size"
// =============================

export type ElevationStrength = 'soft' | 'hard'
export type ElevationDirection = 'down' | 'up'
export type ElevationSize = 'large' | 'medium' | 'small'

export type ElevationToken = `${ElevationStrength}/${ElevationDirection}/${ElevationSize}`

// Blur radius by size
export const ElevationBlur = {
  small: 2,
  medium: 4,
  large: 8,
} as const

// Shadow opacity by strength
export const ElevationOpacity = {
  soft: 0.22,
  hard: 0.3,
} as const

// Shadow offset by direction (down = below, up = above)
export const ElevationDirectionMap = {
  down: { dx: 0, dy: 4 },
  up: { dx: 0, dy: -4 },
} as const

// =============================
// Core function
// =============================
export function getElevation(token: ElevationToken) {
  const parts = token.split('/') as [ElevationStrength, ElevationDirection?, ElevationSize?]
  const [strength, dir, size] = parts

  const level = strength ?? 'soft'
  const direction = dir ?? 'down'
  const sizeKey = size ?? 'medium'

  return {
    blur: ElevationBlur[sizeKey],
    opacity: ElevationOpacity[level],
    ...ElevationDirectionMap[direction],
  }
}
