import { useSyncExternalStore } from 'react'

import { remoteConfigDefaults } from '@/configs/remote-config.defaults'

import { openRemoteConfig } from './remote-config-source'
import type {
  RemoteConfigKey,
  RemoteConfigSource,
  RemoteConfigValues,
} from './remote-config-values'

export { parseRemoteValues } from './remote-config-values'
export type { RemoteConfigKey, RemoteConfigValues } from './remote-config-values'

let values: RemoteConfigValues = { ...remoteConfigDefaults } as RemoteConfigValues
const listeners = new Set<() => void>()

function warn(label: string, error: unknown) {
  if (__DEV__) console.warn(`[firebase] ${label}`, error)
}

function applyValues(source: RemoteConfigSource): void {
  try {
    values = source.read()
  } catch (error) {
    warn('read remote config failed', error)
    return
  }
  listeners.forEach((listener) => listener())
}

/**
 * Init: applies defaults + the last activated (cached) values, then fetches in the background.
 * Resolves after the cached values are read; it never waits for the network fetch.
 */
export async function initRemoteConfig(): Promise<void> {
  let source: RemoteConfigSource | null
  try {
    source = await openRemoteConfig()
  } catch (error) {
    warn('initRemoteConfig failed', error)
    return
  }
  if (!source) return
  applyValues(source)

  // Not awaited: startup never waits on the network. The `fetchTimeoutMillis` setting bounds the
  // request, and a late success still updates the hooks.
  source
    .fetchAndActivate()
    .then(() => applyValues(source))
    .catch((error) => warn('remote config fetch failed, keeping cached values', error))
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
