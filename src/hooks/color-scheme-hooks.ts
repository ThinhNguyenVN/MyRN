import { useSyncExternalStore } from 'react'
import { Appearance } from 'react-native'

import type { ThemeName } from '@/theme/colors'

const subscribeToColorScheme = (onStoreChange: () => void) => {
  const subscription = Appearance.addChangeListener(onStoreChange)
  return () => subscription.remove()
}

const getColorScheme = (): ThemeName => (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light')
const getServerColorScheme = (): ThemeName => 'light'

export function useHydratedColorScheme(): ThemeName {
  return useSyncExternalStore(subscribeToColorScheme, getColorScheme, getServerColorScheme)
}
