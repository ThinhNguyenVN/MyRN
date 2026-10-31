import { loadFirebase } from './native-modules'
import { getRemoteConfigValue, initRemoteConfig, parseRemoteValues } from './remote-config'

jest.mock('./native-modules', () => ({ loadFirebase: jest.fn(() => null) }))

const mockedLoadFirebase = loadFirebase as jest.Mock

function rawValue(value: string) {
  return {
    asBoolean: () => value === 'true',
    asNumber: () => Number(value),
    asString: () => value,
  }
}

describe('remote config', () => {
  it('parses each key by the type of its default', () => {
    const values = parseRemoteValues((key) =>
      rawValue(key === 'sample_feature_enabled' ? 'true' : '2.3.0'),
    )
    expect(values).toEqual({ sample_feature_enabled: true, min_supported_app_version: '2.3.0' })
  })

  it('returns defaults when Firebase is unavailable', async () => {
    await initRemoteConfig()
    expect(getRemoteConfigValue('sample_feature_enabled')).toBe(false)
    expect(getRemoteConfigValue('min_supported_app_version')).toBe('1.0.0')
  })

  it('reads activated values on init and does not wait for the fetch', async () => {
    jest.useFakeTimers()
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const instance = { settings: {}, defaultConfig: {} }
    const remoteConfig = {
      getRemoteConfig: () => instance,
      ensureInitialized: jest.fn(async () => {}),
      fetchAndActivate: jest.fn(() => new Promise<boolean>(() => {})),
      getValue: (_: unknown, key: string) =>
        rawValue(key === 'sample_feature_enabled' ? 'true' : '9.9.9'),
    }
    mockedLoadFirebase.mockReturnValue({ remoteConfig })

    await initRemoteConfig()

    expect(instance.defaultConfig).toEqual({
      sample_feature_enabled: false,
      min_supported_app_version: '1.0.0',
    })
    expect(remoteConfig.fetchAndActivate).toHaveBeenCalled()
    expect(getRemoteConfigValue('sample_feature_enabled')).toBe(true)
    expect(getRemoteConfigValue('min_supported_app_version')).toBe('9.9.9')

    // The hung fetch times out and keeps the cached values.
    jest.runOnlyPendingTimers()
    for (let i = 0; i < 5; i++) await Promise.resolve()
    expect(warn).toHaveBeenCalled()
    expect(getRemoteConfigValue('sample_feature_enabled')).toBe(true)
    warn.mockRestore()
    jest.useRealTimers()
  })
})
