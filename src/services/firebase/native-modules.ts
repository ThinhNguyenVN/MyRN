/* eslint-disable @typescript-eslint/no-require-imports -- lazy requires keep Expo Go from loading missing native modules */
import Constants, { ExecutionEnvironment } from 'expo-constants'

import type { FirebaseModules } from './types'

let cached: FirebaseModules | null | undefined

/**
 * Native Firebase modules, or `null` when they cannot run: Expo Go has no RNFirebase native
 * code, and a dev build made before Firebase was added has none either. Every service treats
 * `null` as "no-op", so product code never branches on the runtime. Web has its own file.
 */
export function loadFirebase(): FirebaseModules | null {
  if (cached !== undefined) return cached

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    cached = null
    return cached
  }

  try {
    cached = {
      analytics: require('@react-native-firebase/analytics'),
      crashlytics: require('@react-native-firebase/crashlytics'),
      messaging: require('@react-native-firebase/messaging'),
      remoteConfig: require('@react-native-firebase/remote-config'),
      notifications: require('expo-notifications'),
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[firebase] native modules unavailable, Firebase calls are no-ops.', error)
    }
    cached = null
  }
  return cached
}
