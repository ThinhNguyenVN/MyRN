/**
 * Firebase foundation (Analytics, Crashlytics, Remote Config, Cloud Messaging).
 * Every call is a safe no-op on web, in Expo Go, and in builds without Firebase native code.
 * Guide: `.docs/firebase-standard.md`.
 */
export { logEvent, logScreenView, setAnalyticsUserId } from './analytics'
export type { AnalyticsEventMap, AnalyticsEventName } from './analytics-events'
export { crashLog, recordError, setCrashUserId } from './crashlytics'
export { getCollectionEnabled, setCollectionEnabled } from './consent'
export { useFirebaseScreenTracking, useFirebaseUser, usePushNotificationNavigation } from './hooks'
export { initFirebase } from './init'
export {
  getPushPermissionStatus,
  getPushToken,
  registerBackgroundMessageHandler,
  requestPushPermission,
  setPushTokenHandler,
  subscribeNotificationOpens,
} from './messaging'
export type { NotificationOpenHandler, PushTokenHandler } from './messaging'
export type { PushPermissionStatus } from './push-utils'
export { getRemoteConfigValue, useRemoteConfig } from './remote-config'
export type { RemoteConfigKey, RemoteConfigValues } from './remote-config'
export { isFirebaseAvailable } from './safe-call'
