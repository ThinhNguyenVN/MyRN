import { firebaseConfig } from '@/configs/firebase.config'
import { remoteConfigDefaults } from '@/configs/remote-config.defaults'

import { loadFirebase } from './native-modules'
import { parseRemoteValues, type RemoteConfigSource } from './remote-config-values'

/** Native (RNFirebase). `null` when Firebase is unavailable. */
export async function openRemoteConfig(): Promise<RemoteConfigSource | null> {
  const modules = loadFirebase()
  if (!modules) return null
  const { remoteConfig } = modules
  const instance = remoteConfig.getRemoteConfig()
  instance.settings = { ...firebaseConfig.remoteConfig }
  instance.defaultConfig = { ...remoteConfigDefaults }
  await remoteConfig.ensureInitialized(instance)
  return {
    read: () => parseRemoteValues((key) => remoteConfig.getValue(instance, key)),
    fetchAndActivate: () => remoteConfig.fetchAndActivate(instance),
  }
}
