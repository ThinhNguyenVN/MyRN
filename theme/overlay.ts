import { ElevationLevel } from './elevation'

/**
 * Overlay cho dark mode — mô phỏng Material
 * Level càng cao → overlay càng sáng
 */
export function overlay(level: ElevationLevel | number, color: string) {
  if (level === 0) return color

  // opacity scale theo material
  const alpha =
    typeof level === 'number'
      ? ([0, 0.08, 0.12, 0.16, 0.18, 0.2][level] ?? 0.12)
      : level === 'soft'
        ? 0.08
        : level === 'medium'
          ? 0.12
          : 0.16

  return applyOverlay(color, alpha)
}

/** Convert hex → rgba blend */
function applyOverlay(hex: string, alpha: number) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
