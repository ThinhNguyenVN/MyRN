import { firebaseConfig } from '@/configs/firebase.config'
import { remoteConfigDefaults } from '@/configs/remote-config.defaults'

import { parseRemoteValues, type RemoteConfigSource } from './remote-config-values'
import { getWebRemoteConfig } from './web-sdk'

/** Web (Firebase JS SDK). `null` when Firebase web is off or the browser lacks IndexedDB. */
export async function openRemoteConfig(): Promise<RemoteConfigSource | null> {
  const instance = await getWebRemoteConfig()
  if (!instance) return null
  const { ensureInitialized, fetchAndActivate, getValue } = await import('firebase/remote-config')
  instance.settings = { ...firebaseConfig.remoteConfig }
  instance.defaultConfig = { ...remoteConfigDefaults }
  await ensureInitialized(instance)
  return {
    read: () => parseRemoteValues((key) => getValue(instance, key)),
    fetchAndActivate: () => fetchAndActivate(instance),
  }
}
