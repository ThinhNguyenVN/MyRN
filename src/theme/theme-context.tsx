import React, { createContext, useCallback, useContext, useMemo } from 'react'

import { ThemeConfigs } from '@/configs/themes'
import { getColor as getColorFromTokens, Themes, ThemeName, TokensType } from '@/theme/colors'
import type { ColorToken } from '@/theme/colors'
import { ElevationToken, getElevation } from './elevation'
import { getSpacing, SpacingType } from './spacing'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Insets } from 'react-native'
import { useIsMobile, useIsMobileSize } from '@/hooks/dimenstions-hooks'
import { Radius, RadiusType } from './radius'

export interface ThemeType {
  themeName: ThemeName
  tokens: TokensType
  getColor: (token: ColorToken) => string
  getSpacing: (spacing: SpacingType) => number
  getElevation: (elevation: ElevationToken) => {
    blur: number
    opacity: number
    dx: number
    dy: number
  }
  getRadius: (radius: RadiusType) => number
  insets: Insets
  isMobileSize: boolean
  isMobile: boolean
  /** Default elevation từ ThemeConfigs (button, alert, checkbox, sidebar, ...). */
  defaultElevation: ElevationToken | 'none'
  /** Haptic mặc định từ ThemeConfigs (pressable, wheel picker, ...). */
  hapticEnabled: boolean
}

const ThemeContext = createContext<ThemeType | null>(null)

interface MyThemeProviderProps {
  value?: ThemeName
  children: React.ReactNode
}

export function MyThemeProvider({ value = 'light', children }: MyThemeProviderProps) {
  const themeName = value
  const tokens = useMemo(() => Themes[themeName], [themeName])
  const insets = useSafeAreaInsets()
  const isMobileSize = useIsMobileSize()
  const isMobile = useIsMobile()

  const getColor = useCallback((token: ColorToken) => getColorFromTokens(token, tokens), [tokens])
  const getRadius = useCallback((radius: RadiusType) => Radius?.[radius] ?? 0, [])
  const contextValue = useMemo<ThemeType>(
    () => ({
      themeName,
      tokens,
      getColor,
      getSpacing,
      getElevation,
      insets,
      isMobileSize,
      getRadius,
      isMobile,
      defaultElevation: ThemeConfigs.elevation,
      hapticEnabled: ThemeConfigs.haptic,
    }),
    [themeName, tokens, getColor, insets, isMobileSize, getRadius, isMobile],
  )

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeType {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within MyThemeProvider')
  }
  return ctx
}

export function useThemedStyles<T>(factory: (theme: ReturnType<typeof useTheme>) => T): T {
  const theme = useTheme()
  return useMemo(() => factory(theme), [factory, theme])
}
