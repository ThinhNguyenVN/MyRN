// =============================
// Elevation Token
// Format: "{soft|medium|hard}[/{direction}]"
// Default direction = "down-left"
// =============================

export const ElevationBlur = {
  soft: 2,
  medium: 6,
  hard: 8,
} as const

export const ElevationOpacity = {
  soft: 0.18,
  medium: 0.22,
  hard: 0.28,
} as const

export const ElevationDirection = {
  'down-left': { dx: -4, dy: 6 },
  'down-right': { dx: 3, dy: 3 },
  down: { dx: 0, dy: 3 },
  'top-left': { dx: -4, dy: -6 },
  'top-right': { dx: 4, dy: -6 },
  top: { dx: 0, dy: -8 },
} as const

export type ElevationLevel = keyof typeof ElevationBlur // soft | medium | hard
export type ElevationDir = keyof typeof ElevationDirection // top/down...
export type ElevationToken = ElevationLevel | `${ElevationLevel}/${ElevationDir}`

// =============================
// 🎯 core function - EXPORT ở đây luôn
// =============================
export function getElevation(token: ElevationToken) {
  const [level, dir] = token.split('/') as [ElevationLevel, ElevationDir?]
  return {
    blur: ElevationBlur[level],
    opacity: 0.25,
    ...ElevationDirection[dir ?? 'down-right'], // default fallback
  }
}
