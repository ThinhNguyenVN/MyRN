import { storageGetItem, storageRemoveItem, storageSetItem } from '@/utils/storage'

export const REFRESH_TOKEN_KEY = 'auth.refreshToken'

export async function getStoredRefreshToken(): Promise<string | null> {
  return storageGetItem(REFRESH_TOKEN_KEY)
}

export async function setStoredRefreshToken(refreshToken: string): Promise<void> {
  await storageSetItem(REFRESH_TOKEN_KEY, refreshToken)
}

export async function removeStoredRefreshToken(): Promise<void> {
  await storageRemoveItem(REFRESH_TOKEN_KEY)
}
