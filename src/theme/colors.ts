import { BrandColorsDark, BrandColorsLight } from '@/configs/brand.config'

// =============================
// LIGHT — Nền ấm, chữ đậm. Tông jewel + stone.
// Gray (stone): 50 = nền sáng nhất → 900 = chữ đậm nhất.
// =============================
export const ColorPaletteLight = {
  // Brand — see src/configs/brand.config.ts to rebrand this kit for a new product.
  ...BrandColorsLight,
  // Neutrals — stone (ấm, không lạnh)
  white: '#ffffff',
  black: '#000000',
  gray50: '#fafaf9',
  gray100: '#f5f5f4',
  gray200: '#e7e5e4',
  gray300: '#d6d3d1',
  gray400: '#a8a29e',
  gray500: '#78716c',
  gray600: '#57534e',
  gray700: '#44403c',
  gray800: '#292524',
  gray900: '#1c1917',
  // Semantic
  danger: '#b91c1c',
  dangerMuted: '#fecaca',
  warning: '#b45309',
  warningMuted: '#fde68a',
  success: '#047857',
  successMuted: '#a7f3d0',
  info: '#0e7490',
  infoMuted: '#a5f3fc',
  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#f5f5f4',
  surface: '#ffffff',
} as const

// =============================
// DARK — Nền tối, chữ mềm (không chói). Gray: 50 = nền tối nhất → 900 = chữ sáng nhất.
// =============================
export const ColorPaletteDark = {
  // Brand — see src/configs/brand.config.ts to rebrand this kit for a new product.
  ...BrandColorsDark,
  // Neutrals — tông xám mềm, không đẩy lên trắng tuyệt đối
  white: '#e4e4e7',
  black: '#09090b',
  gray50: '#09090b',
  gray100: '#18181b',
  gray200: '#27272a',
  gray300: '#3f3f46',
  gray400: '#52525b',
  gray500: '#71717a',
  gray600: '#a1a1aa',
  gray700: '#b4b4b8',
  gray800: '#d4d4d8',
  gray900: '#e4e4e7',
  // Semantic — bớt neon, dễ nhìn
  danger: '#fca5a5',
  dangerMuted: '#7f1d1d',
  warning: '#fcd34d',
  warningMuted: '#78350f',
  success: '#86efac',
  successMuted: '#14532d',
  info: '#67e8f9',
  infoMuted: '#0e7490',
  // Background
  background: '#09090b',
  backgroundSecondary: '#27272a',
  surface: '#18181b',
} as const

export type ColorPalette = typeof ColorPaletteLight

function buildTokens(palette: Readonly<Record<keyof ColorPalette, string>>) {
  return {
    brand: {
      primary: palette.primary,
      secondary: palette.secondary,
      tertiary: palette.tertiary,
      quaternary: palette.quaternary,
      accent: palette.accent,
      black: palette.black,
      white: palette.white,
      gray600: palette.gray600,
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
        secondary: palette.danger,
      },
      warning: {
        primary: palette.warning,
        secondary: palette.warning,
      },
      info: {
        primary: palette.info,
        secondary: palette.info,
      },
      success: {
        primary: palette.success,
        secondary: palette.success,
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
        secondary: palette.danger,
      },
      warning: {
        primary: palette.warning,
        secondary: palette.warning,
      },
      info: {
        primary: palette.info,
        secondary: palette.info,
      },
      success: {
        primary: palette.success,
        secondary: palette.success,
      },
      background: {
        primary: palette.background,
        secondary: palette.backgroundSecondary,
        tertiary: palette.surface,
      },
      disabled: {
        primary: palette.gray400,
      },
    },
    icon: {
      active: {
        primary: palette.gray900,
        secondary: palette.gray700,
        tertiary: palette.white,
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
        secondary: palette.danger,
      },
      warning: {
        primary: palette.warning,
        secondary: palette.warning,
      },
      info: {
        primary: palette.info,
        secondary: palette.info,
      },
      success: {
        primary: palette.success,
        secondary: palette.success,
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
        secondary: palette.dangerMuted,
      },
      warning: {
        primary: palette.warning,
        secondary: palette.warningMuted,
      },
      info: {
        primary: palette.info,
        secondary: palette.infoMuted,
      },
      success: {
        primary: palette.success,
        secondary: palette.successMuted,
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
type RoleState = 'active' | 'inactive' | 'alert' | 'warning' | 'info' | 'success' | 'disabled'
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
