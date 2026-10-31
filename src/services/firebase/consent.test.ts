import { storageGetItem, storageSetItem } from '@/utils/storage'

import {
  applyStoredCollectionConsent,
  COLLECTION_CONSENT_STORAGE_KEY,
  getCollectionEnabled,
  setCollectionEnabled,
} from './consent'
import { loadFirebase } from './native-modules'

jest.mock('@/utils/storage', () => ({
  storageGetItem: jest.fn(),
  storageSetItem: jest.fn(async () => {}),
}))
jest.mock('./native-modules', () => ({ loadFirebase: jest.fn(() => null) }))

const mockedGet = storageGetItem as jest.Mock
const mockedLoadFirebase = loadFirebase as jest.Mock

function fakeModules() {
  return {
    analytics: { getAnalytics: () => 'a', setAnalyticsCollectionEnabled: jest.fn(async () => {}) },
    crashlytics: {
      getCrashlytics: () => 'c',
      setCrashlyticsCollectionEnabled: jest.fn(async () => null),
    },
  }
}

describe('collection consent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedLoadFirebase.mockReturnValue(null)
  })

  it('defaults to enabled when the user never chose', async () => {
    mockedGet.mockResolvedValue(null)
    await expect(getCollectionEnabled()).resolves.toBe(true)
  })

  it('uses the stored choice', async () => {
    mockedGet.mockResolvedValue('false')
    await expect(getCollectionEnabled()).resolves.toBe(false)
  })

  it('stores the choice and applies it to Analytics and Crashlytics', async () => {
    const modules = fakeModules()
    mockedLoadFirebase.mockReturnValue(modules)

    await setCollectionEnabled(false)

    expect(storageSetItem).toHaveBeenCalledWith(COLLECTION_CONSENT_STORAGE_KEY, 'false')
    expect(modules.analytics.setAnalyticsCollectionEnabled).toHaveBeenCalledWith('a', false)
    expect(modules.crashlytics.setCrashlyticsCollectionEnabled).toHaveBeenCalledWith('c', false)
  })

  it('never throws when the native call fails', async () => {
    mockedGet.mockResolvedValue(null)
    const modules = fakeModules()
    modules.analytics.setAnalyticsCollectionEnabled.mockRejectedValue(new Error('native'))
    mockedLoadFirebase.mockReturnValue(modules)
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    await expect(applyStoredCollectionConsent()).resolves.toBeUndefined()
    warn.mockRestore()
  })
})
