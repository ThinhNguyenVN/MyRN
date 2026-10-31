import { applyStoredCollectionConsent } from './consent'
import { initMessaging } from './messaging'
import { initRemoteConfig } from './remote-config'

/**
 * `useAppInit` task. Fast by design: reads local state only (consent, cached Remote Config,
 * existing permission). Network work (Remote Config fetch, FCM token) never blocks the splash.
 */
export async function initFirebase(): Promise<void> {
  await applyStoredCollectionConsent()
  void initMessaging()
  await initRemoteConfig()
}
