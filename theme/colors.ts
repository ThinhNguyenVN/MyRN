export const ColorPalette = {
  primary: '#6366F1',
  secondary: '#3B82F6',
  tertiary: '#06B6D4',
  quaternary: '#10B981',
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
} as const

export const Tokens = {
  brand: {
    primary: ColorPalette.primary,
    secondary: ColorPalette.secondary,
    tertiary: ColorPalette.tertiary,
    quaternary: ColorPalette.quaternary,
  },
  text: {
    active: {
      primary: ColorPalette.gray900,
      secondary: ColorPalette.gray700,
      tertiary: 'red',
      quaternary: ColorPalette.gray300,
    },
    inactive: {
      primary: ColorPalette.gray500,
      secondary: ColorPalette.gray400,
      tertiary: ColorPalette.gray300,
      quaternary: ColorPalette.gray200,
    },
  },

  fill: {
    active: {
      primary: ColorPalette.primary,
      secondary: ColorPalette.secondary,
      tertiary: ColorPalette.tertiary,
      quaternary: ColorPalette.quaternary,
    },
    inactive: {
      primary: ColorPalette.gray300,
      secondary: ColorPalette.gray200,
      tertiary: ColorPalette.gray100,
      quaternary: ColorPalette.gray50,
    },
  },

  icon: {
    active: {
      primary: ColorPalette.gray900,
      secondary: ColorPalette.gray700,
      tertiary: ColorPalette.gray500,
      quaternary: ColorPalette.gray300,
    },
    inactive: {
      primary: ColorPalette.gray500,
      secondary: ColorPalette.gray400,
      tertiary: ColorPalette.gray300,
      quaternary: ColorPalette.gray200,
    },
  },

  border: {
    active: {
      primary: ColorPalette.primary,
      secondary: ColorPalette.secondary,
      tertiary: ColorPalette.tertiary,
      quaternary: ColorPalette.quaternary,
    },
    inactive: {
      primary: ColorPalette.gray400,
      secondary: ColorPalette.gray300,
      tertiary: ColorPalette.gray200,
      quaternary: ColorPalette.gray100,
    },
  },
} as const

export type SemanticColorString<R extends keyof typeof Tokens> =
  `${R & string}/${keyof (typeof Tokens)[R] & string}/${keyof (typeof Tokens)[R][keyof (typeof Tokens)[R]] & string}`

export type BrandColorType = SemanticColorString<'brand'>
export type TextColorType = SemanticColorString<'text'>
export type FillColorType = SemanticColorString<'fill'>
export type IconColorType = SemanticColorString<'icon'>
export type BorderColorType = SemanticColorString<'border'>

export function getColor(
  str: TextColorType | FillColorType | IconColorType | BorderColorType | BrandColorType,
): string {
  const parts = str.split('/')
  if (parts.length === 2) {
    const [role, variant] = parts as [keyof typeof Tokens, keyof (typeof Tokens)['brand']]
    return (Tokens[role] as (typeof Tokens)['brand'])[variant]
  }
  const [role, state, variant] = parts as [
    'text' | 'fill' | 'icon' | 'border',
    'active' | 'inactive',
    keyof (typeof Tokens)['text']['active'],
  ]
  const roleTokens = Tokens[role]
  return roleTokens?.[state]?.[variant] as string
}
