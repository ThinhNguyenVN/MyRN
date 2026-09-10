import { getLocales } from 'expo-localization'

import { FALLBACK_LOCALE, parseAppLocale, resolveSystemLocale } from './locale-resolver'

jest.mock('@/configs/themes', () => ({
  SUPPORTED_LOCALES: ['en', 'vi'],
}))

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}))

const mockedGetLocales = getLocales as jest.MockedFunction<typeof getLocales>

describe('parseAppLocale', () => {
  it('parses region tags to the language code', () => {
    expect(parseAppLocale('vi-VN')).toBe('vi')
    expect(parseAppLocale('en-US')).toBe('en')
  })

  it('returns null for unsupported or empty tags', () => {
    expect(parseAppLocale('fr-FR')).toBeNull()
    expect(parseAppLocale(null)).toBeNull()
    expect(parseAppLocale(undefined)).toBeNull()
  })
})

describe('resolveSystemLocale', () => {
  afterEach(() => {
    mockedGetLocales.mockReset()
  })

  it('returns vi for vi-VN locale', () => {
    mockedGetLocales.mockReturnValue([
      { languageTag: 'vi-VN' } as ReturnType<typeof getLocales>[number],
    ])

    expect(resolveSystemLocale()).toBe('vi')
  })

  it('returns en for en-US locale', () => {
    mockedGetLocales.mockReturnValue([
      { languageTag: 'en-US' } as ReturnType<typeof getLocales>[number],
    ])

    expect(resolveSystemLocale()).toBe('en')
  })

  it('returns fallback for unsupported locale', () => {
    mockedGetLocales.mockReturnValue([
      { languageTag: 'fr-FR' } as ReturnType<typeof getLocales>[number],
    ])

    expect(resolveSystemLocale()).toBe(FALLBACK_LOCALE)
  })

  it('returns fallback when locale list is empty', () => {
    mockedGetLocales.mockReturnValue([] as unknown as ReturnType<typeof getLocales>)

    expect(resolveSystemLocale()).toBe(FALLBACK_LOCALE)
  })

  it('returns fallback when getLocales is unavailable', () => {
    mockedGetLocales.mockReturnValue(undefined as unknown as ReturnType<typeof getLocales>)

    expect(resolveSystemLocale()).toBe(FALLBACK_LOCALE)
  })
})
