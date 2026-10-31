import { firebaseConfig } from '@/configs/firebase.config'
import { storageGetItem, storageSetItem } from '@/utils/storage'

import { withFirebaseAsync } from './safe-call'

export const COLLECTION_CONSENT_STORAGE_KEY = 'firebase.collectionEnabled'

/** Stored choice, or `firebaseConfig.collectionEnabledByDefault` when the user never chose. */
export async function getCollectionEnabled(): Promise<boolean> {
  const stored = await storageGetItem(COLLECTION_CONSENT_STORAGE_KEY)
  if (stored === null) return firebaseConfig.collectionEnabledByDefault
  return stored === 'true'
}

async function applyCollectionEnabled(enabled: boolean): Promise<void> {
  await withFirebaseAsync('applyCollectionEnabled', undefined, async (modules) => {
    await Promise.all([
      modules.analytics.setAnalyticsCollectionEnabled(modules.analytics.getAnalytics(), enabled),
      modules.crashlytics.setCrashlyticsCollectionEnabled(
        modules.crashlytics.getCrashlytics(),
        enabled,
      ),
    ])
  })
}

/** Turns Analytics + Crashlytics collection on/off and remembers the choice. */
export async function setCollectionEnabled(enabled: boolean): Promise<void> {
  await storageSetItem(COLLECTION_CONSENT_STORAGE_KEY, String(enabled))
  await applyCollectionEnabled(enabled)
}

/** Init: re-applies the stored choice (native flags can differ after reinstall/config change). */
export async function applyStoredCollectionConsent(): Promise<void> {
  await applyCollectionEnabled(await getCollectionEnabled())
}
