// =============================
// LIGHT — Nền sáng, chữ tối. Dùng khi background là white/light gray.
// Gray: 50 = nền sáng nhất → 900 = chữ đậm nhất.
// =============================
export const ColorPaletteLight = {
  // Brand
  primary: '#0ea5e9',
  secondary: '#06b6d4',
  tertiary: '#10b981',
  quaternary: '#8b5cf6',
  // Neutrals — light theme: số càng lớn càng tối (dùng cho chữ / border)
  white: '#ffffff',
  black: '#000000',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  // Semantic
  danger: '#dc2626',
  warning: '#d97706',
  success: '#16a34a',
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
} as const

// =============================
// DARK — Nền tối, chữ sáng. Dùng khi background là black/dark gray.
// Gray: 50 = nền tối nhất → 900 = chữ sáng nhất (ngược với light).
// =============================
export const ColorPaletteDark = {
  // Brand — tông sáng hơn để nổi trên nền tối
  primary: '#38bdf8',
  secondary: '#22d3ee',
  tertiary: '#34d399',
  quaternary: '#a78bfa',
  // Neutrals — dark theme: số càng lớn càng sáng (dùng cho chữ)
  white: '#ffffff',
  black: '#000000',
  gray50: '#09090b',
  gray100: '#18181b',
  gray200: '#27272a',
  gray300: '#3f3f46',
  gray400: '#52525b',
  gray500: '#71717a',
  gray600: '#a1a1aa',
  gray700: '#d4d4d8',
  gray800: '#e4e4e7',
  gray900: '#fafafa',
  // Semantic — tông sáng hơn trên nền tối
  danger: '#f87171',
  warning: '#fbbf24',
  success: '#4ade80',
  background: '#18181b',
  backgroundSecondary: '#71717a',
} as const

export type ColorPalette = typeof ColorPaletteLight

function buildTokens(palette: Readonly<Record<keyof ColorPalette, string>>) {
  return {
    brand: {
      primary: palette.primary,
      secondary: palette.secondary,
      tertiary: palette.tertiary,
      quaternary: palette.quaternary,
    },
    text: {
      active: {
        primary: palette.gray900,
        secondary: palette.gray700,
        tertiary: palette.gray500,
        quaternary: palette.gray300,
      },
      inactive: {
        primary: palette.gray500,
        secondary: palette.gray400,
        tertiary: palette.gray300,
        quaternary: palette.gray200,
      },
      alert: {
        primary: palette.danger,
      },
      warning: {
        primary: palette.warning,
      },
    },
    fill: {
      active: {
        primary: palette.primary,
        secondary: palette.secondary,
        tertiary: palette.tertiary,
        quaternary: palette.quaternary,
      },
      inactive: {
        primary: palette.gray300,
        secondary: palette.gray200,
        tertiary: palette.gray100,
        quaternary: palette.gray50,
      },
      alert: {
        primary: palette.danger,
      },
      warning: {
        primary: palette.warning,
      },
      background: {
        primary: palette.background,
        secondary: palette.backgroundSecondary,
      },
    },
    icon: {
      active: {
        primary: palette.gray900,
        secondary: palette.gray700,
        tertiary: palette.gray500,
        quaternary: palette.gray300,
      },
      inactive: {
        primary: palette.gray500,
        secondary: palette.gray400,
        tertiary: palette.gray300,
        quaternary: palette.gray200,
      },
      alert: {
        primary: palette.danger,
      },
      warning: {
        primary: palette.warning,
      },
    },
    border: {
      active: {
        primary: palette.primary,
        secondary: palette.secondary,
        tertiary: palette.tertiary,
        quaternary: palette.quaternary,
      },
      inactive: {
        primary: palette.gray400,
        secondary: palette.gray300,
        tertiary: palette.gray200,
        quaternary: palette.gray100,
      },
      alert: {
        primary: palette.danger,
      },
      warning: {
        primary: palette.warning,
      },
    },
  } as const
}

export const TokensLight = buildTokens(ColorPaletteLight)
export const TokensDark = buildTokens(ColorPaletteDark)

export type TokensType = typeof TokensLight

export type ThemeName = 'light' | 'dark'

export const Themes: Record<ThemeName, TokensType> = {
  light: TokensLight,
  dark: TokensDark,
}

// Token string types
type RoleState = 'active' | 'inactive' | 'alert' | 'warning'
type FillState = RoleState | 'background'
type ActiveInactiveVariant = keyof TokensType['text']['active']
type AlertWarningVariant = keyof TokensType['text']['alert']
type FillBackgroundVariant = keyof TokensType['fill']['background']
type SemanticColorStringThree =
  | `text/${RoleState}/${ActiveInactiveVariant | AlertWarningVariant}`
  | `fill/${FillState}/${ActiveInactiveVariant | AlertWarningVariant | FillBackgroundVariant}`
  | `icon/${RoleState}/${ActiveInactiveVariant | AlertWarningVariant}`
  | `border/${RoleState}/${ActiveInactiveVariant | AlertWarningVariant}`

export type BrandColorType = `brand/${keyof TokensType['brand']}`
export type TextColorType = Extract<SemanticColorStringThree, `text/${string}`>
export type FillColorType = Extract<SemanticColorStringThree, `fill/${string}`>
export type IconColorType = Extract<SemanticColorStringThree, `icon/${string}`>
export type BorderColorType = Extract<SemanticColorStringThree, `border/${string}`>

export type ColorToken =
  | TextColorType
  | FillColorType
  | IconColorType
  | BorderColorType
  | BrandColorType

export function getColor(str: ColorToken, tokens: TokensType): string {
  const parts = str.split('/')
  if (parts.length === 2) {
    const [role, variant] = parts as [keyof TokensType, keyof TokensType['brand']]
    return (tokens[role] as TokensType['brand'])[variant]
  }
  const [role, state, variant] = parts as ['text' | 'fill' | 'icon' | 'border', string, string]
  const roleTokens = tokens[role] as Record<string, Record<string, string>>
  const stateTokens = roleTokens?.[state]
  return (stateTokens?.[variant] ?? '') as string
}
