import { getLocales } from 'expo-localization'
import { isNil } from 'lodash'

import { SUPPORTED_LOCALES } from '@/configs/themes'

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
export { SUPPORTED_LOCALES }

export const FALLBACK_LOCALE: AppLocale = 'en'

/** Display order for the language switcher (product fallback first). */
export const LOCALE_SWITCH_ORDER: AppLocale[] = [
  FALLBACK_LOCALE,
  ...SUPPORTED_LOCALES.filter((locale) => locale !== FALLBACK_LOCALE),
]

export function parseAppLocale(tag?: string | null): AppLocale | null {
  if (!tag) {
    return null
  }
  const language = tag.toLowerCase().split('-')[0]
  if (SUPPORTED_LOCALES.includes(language as AppLocale)) {
    return language as AppLocale
  }
  return null
}

export function normalizeAppLocale(tag?: string | null): AppLocale {
  return parseAppLocale(tag) ?? FALLBACK_LOCALE
}

export function resolveSystemLocale(): AppLocale {
  const locales = getLocales()
  if (isNil(locales) || locales.length === 0) {
    return FALLBACK_LOCALE
  }
  for (const locale of locales) {
    const parsed = parseAppLocale(locale.languageTag)
    if (parsed) {
      return parsed
    }
  }
  return FALLBACK_LOCALE
}
