import { useSyncExternalStore } from 'react'

import { firebaseConfig } from '@/configs/firebase.config'
import { remoteConfigDefaults } from '@/configs/remote-config.defaults'

import { withFirebase, withFirebaseAsync } from './safe-call'

type Defaults = typeof remoteConfigDefaults
type Widen<T> = T extends boolean ? boolean : T extends number ? number : string

export type RemoteConfigKey = keyof Defaults
export type RemoteConfigValues = { [K in RemoteConfigKey]: Widen<Defaults[K]> }

/** Reads one raw value per key and parses it by the type of its default. */
export function parseRemoteValues(
  read: (key: string) => { asBoolean(): boolean; asNumber(): number; asString(): string },
): RemoteConfigValues {
  const values = {} as Record<string, boolean | number | string>
  for (const key of Object.keys(remoteConfigDefaults) as RemoteConfigKey[]) {
    const fallback = remoteConfigDefaults[key] as boolean | number | string
    const raw = read(key)
    if (typeof fallback === 'boolean') values[key] = raw.asBoolean()
    else if (typeof fallback === 'number') {
      const parsed = raw.asNumber()
      values[key] = Number.isFinite(parsed) ? parsed : fallback
    } else values[key] = raw.asString()
  }
  return values as RemoteConfigValues
}

let values: RemoteConfigValues = { ...remoteConfigDefaults } as RemoteConfigValues
const listeners = new Set<() => void>()

function readActivatedValues(): void {
  const next = withFirebase('readRemoteConfig', null, ({ remoteConfig }) => {
    const instance = remoteConfig.getRemoteConfig()
    return parseRemoteValues((key) => remoteConfig.getValue(instance, key))
  })
  if (!next) return
  values = next
  listeners.forEach((listener) => listener())
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * Init: applies defaults + the last activated (cached) values, then fetches in the background.
 * Resolves after the cached values are read; it never waits for the network fetch.
 */
export async function initRemoteConfig(): Promise<void> {
  await withFirebaseAsync('initRemoteConfig', undefined, async ({ remoteConfig }) => {
    const instance = remoteConfig.getRemoteConfig()
    instance.settings = { ...firebaseConfig.remoteConfig }
    instance.defaultConfig = { ...remoteConfigDefaults }
    await remoteConfig.ensureInitialized(instance)
    readActivatedValues()

    void withTimeout(
      remoteConfig.fetchAndActivate(instance),
      firebaseConfig.remoteConfig.fetchTimeoutMillis,
    )
      .then(readActivatedValues)
      .catch((error) => {
        if (__DEV__)
          console.warn('[firebase] remote config fetch failed, keeping cached values', error)
      })
  })
}

/** Current value outside React (defaults until init has read the cache). */
export function getRemoteConfigValue<K extends RemoteConfigKey>(key: K): RemoteConfigValues[K] {
  return values[key]
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Typed Remote Config value; re-renders when a background fetch activates new values. */
export function useRemoteConfig<K extends RemoteConfigKey>(key: K): RemoteConfigValues[K] {
  return useSyncExternalStore(
    subscribe,
    () => values[key],
    () => values[key],
  )
}
