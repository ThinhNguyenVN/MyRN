/**
 * Brand palette override point. A product forked from this kit rebrands by editing the five
 * colors here — everything else in `src/theme/colors.ts` (neutrals, semantic danger/warning/
 * success/info, backgrounds) is kit-wide scaffolding that most products keep as-is.
 */
export type BrandPalette = {
  primary: string
  secondary: string
  tertiary: string
  quaternary: string
  /** Highlight / link / secondary CTA accent. */
  accent: string
}

export const BrandColorsLight: BrandPalette = {
  primary: '#0d9488',
  secondary: '#c2410c',
  tertiary: '#6d28d9',
  quaternary: '#be185d',
  accent: '#0891b2',
}

/** Same hues, tuned down so they stay legible against a dark background. */
export const BrandColorsDark: BrandPalette = {
  primary: '#0d9488',
  secondary: '#fdba74',
  tertiary: '#c4b5fd',
  quaternary: '#f9a8d4',
  accent: '#67e8f9',
}
