import { storageGetItem, storageSetItem } from '@/utils/storage'

import { getStoredLocale, LOCALE_STORAGE_KEY, setStoredLocale } from './locale-storage'

jest.mock('@/utils/storage', () => ({
  storageGetItem: jest.fn(),
  storageSetItem: jest.fn(),
}))

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}))

const mockedGetItem = storageGetItem as jest.MockedFunction<typeof storageGetItem>
const mockedSetItem = storageSetItem as jest.MockedFunction<typeof storageSetItem>

describe('locale-storage', () => {
  afterEach(() => {
    mockedGetItem.mockReset()
    mockedSetItem.mockReset()
  })

  it('returns a supported stored locale', async () => {
    mockedGetItem.mockResolvedValue('en')

    await expect(getStoredLocale()).resolves.toBe('en')
    expect(mockedGetItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY)
  })

  it('returns null for missing or unsupported stored values', async () => {
    mockedGetItem.mockResolvedValueOnce(null)
    await expect(getStoredLocale()).resolves.toBeNull()

    mockedGetItem.mockResolvedValueOnce('fr')
    await expect(getStoredLocale()).resolves.toBeNull()
  })

  it('persists the locale key', async () => {
    mockedSetItem.mockResolvedValue(undefined)

    await setStoredLocale('en')

    expect(mockedSetItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY, 'en')
  })
})
