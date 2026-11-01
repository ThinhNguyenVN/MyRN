/**
 * Firebase JS SDK for web. Only `*.web.ts` files import this module, so native bundles never
 * include the JS SDK; the SDK packages themselves are loaded with dynamic `import()` the first
 * time a feature needs them.
 *
 * Firebase web is on when `firebase/<env>/firebase-web.json` exists (`app.config.ts` copies it
 * to `extra.firebaseWeb`). Without it, or during static rendering, every getter returns `null`.
 */
import Constants from 'expo-constants'
import type { Analytics } from 'firebase/analytics'
import type { FirebaseApp, FirebaseOptions } from 'firebase/app'
import type { Messaging } from 'firebase/messaging'
import type { RemoteConfig } from 'firebase/remote-config'

import { getCollectionEnabled } from './consent-store'

export type WebFirebaseConfig = FirebaseOptions & {
  apiKey: string
  appId: string
  projectId: string
  /** Web Push certificate key (Firebase console → Cloud Messaging). Optional: Firebase default. */
  vapidKey?: string
}

export function warnWeb(label: string, error: unknown): void {
  if (__DEV__) console.warn(`[firebase] ${label}`, error)
}

export function getWebFirebaseConfig(): WebFirebaseConfig | null {
  if (typeof window === 'undefined') return null
  const config = (Constants.expoConfig?.extra as { firebaseWeb?: WebFirebaseConfig } | undefined)
    ?.firebaseWeb
  if (!config || !config.apiKey || !config.appId || !config.projectId) return null
  return config
}

/** Memoizes an async loader; a failure is logged once and resolves to `null`. */
function lazy<T>(label: string, load: () => Promise<T | null>): () => Promise<T | null> {
  let promise: Promise<T | null> | null = null
  return () => {
    promise ??= load().catch((error) => {
      warnWeb(`${label} unavailable`, error)
      return null
    })
    return promise
  }
}

export const getWebApp = lazy<FirebaseApp>('app', async () => {
  const config = getWebFirebaseConfig()
  if (!config) return null
  const { getApps, initializeApp } = await import('firebase/app')
  const { vapidKey: _vapidKey, ...options } = config
  return getApps()[0] ?? initializeApp(options)
})

/** GA4 property id flag: set before Analytics loads so nothing is sent without consent. */
export function setGaDisabled(disabled: boolean): void {
  const measurementId = getWebFirebaseConfig()?.measurementId
  if (measurementId)
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = disabled
}

export const getWebAnalytics = lazy<Analytics>('analytics', async () => {
  const config = getWebFirebaseConfig()
  if (!config?.measurementId) return null
  const app = await getWebApp()
  if (!app) return null
  const { getAnalytics, isSupported } = await import('firebase/analytics')
  if (!(await isSupported())) return null
  setGaDisabled(!(await getCollectionEnabled()))
  return getAnalytics(app)
})

export const getWebRemoteConfig = lazy<RemoteConfig>('remote config', async () => {
  const app = await getWebApp()
  if (!app) return null
  const { getRemoteConfig, isSupported } = await import('firebase/remote-config')
  if (!(await isSupported())) return null
  return getRemoteConfig(app)
})

/** `null` when the browser has no push support (e.g. iOS Safari outside a home-screen web app). */
export const getWebMessaging = lazy<Messaging>('messaging', async () => {
  if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) return null
  const app = await getWebApp()
  if (!app) return null
  const { getMessaging, isSupported } = await import('firebase/messaging')
  if (!(await isSupported())) return null
  return getMessaging(app)
})

/** Logs a GA4 event when Analytics is available. Never throws. */
export function logWebEvent(name: string, params?: Record<string, unknown>): void {
  void getWebAnalytics()
    .then(async (analytics) => {
      if (!analytics) return
      const { logEvent } = await import('firebase/analytics')
      logEvent(analytics, name, params)
    })
    .catch((error) => warnWeb(`logEvent ${name} failed`, error))
}
