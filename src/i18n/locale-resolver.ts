import { getLocales } from 'expo-localization'
import { SUPPORTED_LOCALES } from '@/configs/themes'

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]
export { SUPPORTED_LOCALES }

export const FALLBACK_LOCALE: AppLocale = 'en'

function normalizeLocaleTag(tag?: string | null): AppLocale | null {
  if (!tag) return null
  const language = tag.toLowerCase().split('-')[0]
  if (SUPPORTED_LOCALES.includes(language as AppLocale)) {
    return language as AppLocale
  }
  return null
}

export function resolveSystemLocale(): AppLocale {
  const locales = getLocales()
  for (const locale of locales) {
    const normalized = normalizeLocaleTag(locale.languageTag)
    if (normalized) return normalized
  }
  return FALLBACK_LOCALE
}
