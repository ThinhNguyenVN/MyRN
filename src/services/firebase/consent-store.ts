import { firebaseConfig } from '@/configs/firebase.config'
import { storageGetItem, storageSetItem } from '@/utils/storage'

export const COLLECTION_CONSENT_STORAGE_KEY = 'firebase.collectionEnabled'

/** Stored choice, or `firebaseConfig.collectionEnabledByDefault` when the user never chose. */
export async function getCollectionEnabled(): Promise<boolean> {
  const stored = await storageGetItem(COLLECTION_CONSENT_STORAGE_KEY)
  if (stored === null) return firebaseConfig.collectionEnabledByDefault
  return stored === 'true'
}

export async function storeCollectionEnabled(enabled: boolean): Promise<void> {
  await storageSetItem(COLLECTION_CONSENT_STORAGE_KEY, String(enabled))
}
