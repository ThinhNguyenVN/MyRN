import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import {
  FALLBACK_LOCALE,
  resolveSystemLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
} from './locale-resolver'
import en from './resources/en.json'
import vi from './resources/vi.json'

const resources = {
  en: { translation: en },
  vi: { translation: vi },
} as const

if (!i18n.isInitialized) {
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
  if (i18n.language === locale) return
  // eslint-disable-next-line import/no-named-as-default-member
  void i18n.changeLanguage(locale)
}

export { i18n }
