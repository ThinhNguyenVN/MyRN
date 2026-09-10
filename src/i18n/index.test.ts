import { getLocales } from 'expo-localization'

import { storageGetItem, storageSetItem } from '@/utils/storage'

import { hydrateAppLocale, persistAppLocale, setAppLocale, i18n } from './index'
import { FALLBACK_LOCALE } from './locale-resolver'

jest.mock('@/utils/storage', () => ({
  storageGetItem: jest.fn(),
  storageSetItem: jest.fn(),
}))

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}))

const mockedGetItem = storageGetItem as jest.MockedFunction<typeof storageGetItem>
const mockedSetItem = storageSetItem as jest.MockedFunction<typeof storageSetItem>
const mockedGetLocales = getLocales as jest.MockedFunction<typeof getLocales>

describe('app locale', () => {
  afterEach(async () => {
    mockedGetItem.mockReset()
    mockedSetItem.mockReset()
    mockedGetLocales.mockReset()
    await i18n.changeLanguage(FALLBACK_LOCALE)
  })

  it('changes language when the locale differs', async () => {
    await setAppLocale('vi')
    expect(i18n.language).toBe('vi')
  })

  it('hydrates a stored locale over the device locale', async () => {
    mockedGetItem.mockResolvedValue('vi')
    mockedGetLocales.mockReturnValue([
      { languageTag: 'en-US' } as ReturnType<typeof getLocales>[number],
    ])

    await hydrateAppLocale()

    expect(i18n.language).toBe('vi')
  })

  it('applies the device locale when storage is empty', async () => {
    mockedGetItem.mockResolvedValue(null)
    mockedGetLocales.mockReturnValue([
      { languageTag: 'vi-VN' } as ReturnType<typeof getLocales>[number],
    ])
    await i18n.changeLanguage('en')

    await hydrateAppLocale()

    expect(i18n.language).toBe('vi')
  })

  it('falls back when storage is empty and the device locale is unsupported', async () => {
    mockedGetItem.mockResolvedValue(null)
    mockedGetLocales.mockReturnValue([
      { languageTag: 'fr-FR' } as ReturnType<typeof getLocales>[number],
    ])
    await i18n.changeLanguage('vi')

    await hydrateAppLocale()

    expect(i18n.language).toBe(FALLBACK_LOCALE)
  })

  it('persists the chosen locale', async () => {
    mockedSetItem.mockResolvedValue(undefined)

    await persistAppLocale('vi')

    expect(mockedSetItem).toHaveBeenCalledWith('app.locale', 'vi')
  })
})
