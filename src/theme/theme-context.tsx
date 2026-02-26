import React, { createContext, useCallback, useContext, useMemo } from 'react'

import { getColor as getColorFromTokens, Themes, ThemeName, TokensType } from '@/theme/colors'
import type { ColorToken } from '@/theme/colors'
import { ElevationToken, getElevation } from './elevation'
import { getSpacing, SpacingType } from './spacing'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Insets } from 'react-native'

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
  insets: Insets
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

  const getColor = useCallback((token: ColorToken) => getColorFromTokens(token, tokens), [tokens])
  const contextValue = useMemo<ThemeType>(
    () => ({ themeName, tokens, getColor, getSpacing, getElevation, insets }),
    [themeName, tokens, getColor, insets],
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
