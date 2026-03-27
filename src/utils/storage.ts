import * as SecureStore from 'expo-secure-store'

import { isWeb } from '@/constants/dimensions'

function hasWebStorage(): boolean {
  return isWeb && typeof localStorage !== 'undefined'
}

export async function storageGetItem(key: string): Promise<string | null> {
  if (hasWebStorage()) {
    return localStorage.getItem(key)
  }
  return SecureStore.getItemAsync(key)
}

export async function storageSetItem(key: string, value: string): Promise<void> {
  if (hasWebStorage()) {
    localStorage.setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}

export async function storageRemoveItem(key: string): Promise<void> {
  if (hasWebStorage()) {
    localStorage.removeItem(key)
    return
  }
  await SecureStore.deleteItemAsync(key)
}
