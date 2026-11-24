/**
 * Colours of the featured plan card (and the column it heads in a comparison). They paint on the
 * card's own gradient, so they stay the same in light and dark themes; a product passes its own
 * brand via `palette` (theme-exempt: fixed on-gradient ink, not theme surfaces).
 */
export type FeaturedPalette = {
  /** Diagonal background of the featured card, 2–3 stops. */
  gradient: readonly [string, string, ...string[]]
  /** Ink on the gradient. */
  ink: string
  /** Secondary ink on the gradient (tagline, captions). */
  mutedInk: string
  /** The one accent of the featured card: ribbon, checks, selected border. */
  accent: string
  /** Ink on `accent` fills. */
  accentInk: string
  /** Call to action fill, 2 stops. */
  cta: readonly [string, string]
  /** Thin border, divider and badge fills on the gradient. */
  overlay: string
  /** Light orbs behind the content, for depth. */
  orb: string
  orbSecondary: string
  /** Halo under the card when hovered. */
  glow: string
}

// theme-exempt: navy + amber default, the my-store look this kit was taken from.
export const DEFAULT_FEATURED_PALETTE: FeaturedPalette = {
  gradient: ['#071a52', '#00288e', '#1e40af'],
  ink: '#ffffff',
  mutedInk: 'rgba(255, 255, 255, 0.74)',
  accent: '#fbbf24',
  accentInk: '#451a03',
  cta: ['#fcd34d', '#f59e0b'],
  overlay: 'rgba(255, 255, 255, 0.16)',
  orb: 'rgba(96, 165, 250, 0.22)',
  orbSecondary: 'rgba(251, 191, 36, 0.1)',
  glow: 'rgba(0, 40, 142, 0.7)',
}

/** Soft light sweep that crosses the featured card once per hover. */
export const PRICING_SHINE = [
  'rgba(255,255,255,0)',
  'rgba(255,255,255,0.22)',
  'rgba(255,255,255,0)',
] as const

export function featuredPaletteOf(palette?: Partial<FeaturedPalette>): FeaturedPalette {
  return palette ? { ...DEFAULT_FEATURED_PALETTE, ...palette } : DEFAULT_FEATURED_PALETTE
}

export const PLAN_CARD_RADIUS = 24
/** From this share of a limit a usage meter turns to the warning colour. */
export const USAGE_WARNING_RATIO = 0.8
