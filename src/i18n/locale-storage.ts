import { storageGetItem, storageSetItem } from '@/utils/storage'

import { parseAppLocale, type AppLocale } from './locale-resolver'

export const LOCALE_STORAGE_KEY = 'app.locale'

export async function getStoredLocale(): Promise<AppLocale | null> {
  const stored = await storageGetItem(LOCALE_STORAGE_KEY)
  return parseAppLocale(stored)
}

export async function setStoredLocale(locale: AppLocale): Promise<void> {
  await storageSetItem(LOCALE_STORAGE_KEY, locale)
}
