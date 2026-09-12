import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { persistAppLocale, setAppLocale } from '@/i18n'
import { normalizeAppLocale, type AppLocale } from '@/i18n/locale-resolver'

export function useAppLocale() {
  const { i18n } = useTranslation()
  const locale = normalizeAppLocale(i18n.language)

  const setLocale = useCallback((next: AppLocale) => {
    void setAppLocale(next)
    void persistAppLocale(next)
  }, [])

  return { locale, setLocale }
}
