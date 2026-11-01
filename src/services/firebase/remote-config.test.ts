import { loadFirebase } from './native-modules'
import { getRemoteConfigValue, initRemoteConfig, parseRemoteValues } from './remote-config'

jest.mock('./native-modules', () => ({ loadFirebase: jest.fn(() => null) }))
jest.mock('@/configs/remote-config.defaults', () => ({
  remoteConfigDefaults: {
    sample_feature_enabled: false,
    min_supported_app_version: '1.0.0',
    sample_limit: 10,
  },
}))

const mockedLoadFirebase = loadFirebase as jest.Mock

function rawValue(value: string) {
  return {
    asBoolean: () => value === 'true',
    asString: () => value,
  }
}

const remote: Record<string, string> = {
  sample_feature_enabled: 'true',
  min_supported_app_version: '2.3.0',
  sample_limit: '25',
}

describe('remote config', () => {
  it('parses each key by the type of its default', () => {
    expect(parseRemoteValues((key) => rawValue(remote[key]))).toEqual({
      sample_feature_enabled: true,
      min_supported_app_version: '2.3.0',
      sample_limit: 25,
    })
  })

  it('keeps the number default for blank or non-numeric values, accepts "0"', () => {
    const parse = (value: string) =>
      parseRemoteValues((key) =>
        rawValue(key === 'sample_limit' ? value : remote[key]),
      ) as unknown as Record<string, unknown>
    expect(parse('').sample_limit).toBe(10)
    expect(parse('abc').sample_limit).toBe(10)
    expect(parse('0').sample_limit).toBe(0)
  })

  it('returns defaults when Firebase is unavailable', async () => {
    await initRemoteConfig()
    expect(getRemoteConfigValue('sample_feature_enabled')).toBe(false)
    expect(getRemoteConfigValue('min_supported_app_version')).toBe('1.0.0')
  })

  it('reads cached values on init without waiting, then applies a late fetch', async () => {
    const instance = { settings: {}, defaultConfig: {} }
    let current: Record<string, string> = { ...remote, min_supported_app_version: '9.9.9' }
    let finishFetch: (activated: boolean) => void = () => {}
    const remoteConfig = {
      getRemoteConfig: () => instance,
      ensureInitialized: jest.fn(async () => {}),
      fetchAndActivate: jest.fn(
        () =>
          new Promise<boolean>((resolve) => {
            finishFetch = resolve
          }),
      ),
      getValue: (_: unknown, key: string) => rawValue(current[key]),
    }
    mockedLoadFirebase.mockReturnValue({ remoteConfig })

    await initRemoteConfig()

    expect(instance.defaultConfig).toEqual({
      sample_feature_enabled: false,
      min_supported_app_version: '1.0.0',
      sample_limit: 10,
    })
    expect(remoteConfig.fetchAndActivate).toHaveBeenCalled()
    expect(getRemoteConfigValue('min_supported_app_version')).toBe('9.9.9')

    // A fetch that lands late (slow network) still updates the values.
    current = { ...current, min_supported_app_version: '10.0.0' }
    finishFetch(true)
    await Promise.resolve()
    await Promise.resolve()
    expect(getRemoteConfigValue('min_supported_app_version')).toBe('10.0.0')
  })
})
