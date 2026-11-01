import { applyCollectionEnabled } from './collection'
import { getCollectionEnabled, storeCollectionEnabled } from './consent-store'

export { COLLECTION_CONSENT_STORAGE_KEY, getCollectionEnabled } from './consent-store'

/** Turns Analytics + Crashlytics (web: error events) collection on/off and remembers the choice. */
export async function setCollectionEnabled(enabled: boolean): Promise<void> {
  await storeCollectionEnabled(enabled)
  await applyCollectionEnabled(enabled)
}

/** Init: re-applies the stored choice (native flags can differ after reinstall/config change). */
export async function applyStoredCollectionConsent(): Promise<void> {
  await applyCollectionEnabled(await getCollectionEnabled())
}
