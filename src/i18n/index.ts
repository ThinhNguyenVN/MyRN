import i18n from 'i18next'
import { isNil } from 'lodash'
import { initReactI18next } from 'react-i18next'

import {
  FALLBACK_LOCALE,
  normalizeAppLocale,
  resolveSystemLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
} from './locale-resolver'
import { getStoredLocale, setStoredLocale } from './locale-storage'
import en from './resources/en.json'
import vi from './resources/vi.json'

const resources = {
  en: { translation: en },
  vi: { translation: vi },
} as const

if (!i18n.isInitialized) {
  // First paint follows the device language; unsupported tags fall back to FALLBACK_LOCALE.
  const lng = resolveSystemLocale()
  // eslint-disable-next-line import/no-named-as-default-member
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  })
}

export function setAppLocale(locale: AppLocale) {
  if (normalizeAppLocale(i18n.language) === locale) {
    return
  }
  // eslint-disable-next-line import/no-named-as-default-member
  return i18n.changeLanguage(locale)
}

export async function persistAppLocale(locale: AppLocale): Promise<void> {
  try {
    await setStoredLocale(locale)
  } catch (error) {
    console.warn('Failed to persist locale', error)
  }
}

export async function hydrateAppLocale(): Promise<void> {
  try {
    const stored = await getStoredLocale()
    await setAppLocale(isNil(stored) ? resolveSystemLocale() : stored)
  } catch (error) {
    console.warn('Failed to hydrate locale', error)
  }
}

export { i18n }
