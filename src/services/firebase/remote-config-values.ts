import { remoteConfigDefaults } from '@/configs/remote-config.defaults'

type Defaults = typeof remoteConfigDefaults
type Widen<T> = T extends boolean ? boolean : T extends number ? number : string

export type RemoteConfigKey = keyof Defaults
export type RemoteConfigValues = { [K in RemoteConfigKey]: Widen<Defaults[K]> }

/** Same shape in RNFirebase and the Firebase JS SDK. */
export type RawRemoteValue = { asBoolean(): boolean; asString(): string }

/** Reads one raw value per key and parses it by the type of its default. */
export function parseRemoteValues(read: (key: string) => RawRemoteValue): RemoteConfigValues {
  const values = {} as Record<string, boolean | number | string>
  for (const key of Object.keys(remoteConfigDefaults) as RemoteConfigKey[]) {
    const fallback = remoteConfigDefaults[key] as boolean | number | string
    const raw = read(key)
    if (typeof fallback === 'boolean') values[key] = raw.asBoolean()
    else if (typeof fallback === 'number') {
      // `asNumber()` returns 0 for blank or non-numeric strings; keep the default instead.
      const text = raw.asString().trim()
      const parsed = Number(text)
      values[key] = text !== '' && Number.isFinite(parsed) ? parsed : fallback
    } else values[key] = raw.asString()
  }
  return values as RemoteConfigValues
}

/** An opened Remote Config instance: defaults + settings applied, cached values activated. */
export type RemoteConfigSource = {
  read(): RemoteConfigValues
  fetchAndActivate(): Promise<unknown>
}
