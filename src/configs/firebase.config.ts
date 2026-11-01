/**
 * Product-tunable Firebase settings. Native project config (google-services.json /
 * GoogleService-Info.plist per env) lives in `firebase/<env>/` — see `.docs/firebase-standard.md`.
 */
export const firebaseConfig = {
  /**
   * Analytics + Crashlytics collection before the user makes a choice. A product that needs
   * opt-in consent (GDPR) sets this to `false` and calls `setCollectionEnabled(true)` after
   * consent. Also set the native auto-collection flags in `firebase.json` so nothing is sent
   * before JS starts.
   */
  collectionEnabledByDefault: true,
  remoteConfig: {
    /** Cache age before a new fetch hits the server. Firebase throttles below ~12 fetches/hour. */
    minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000,
    fetchTimeoutMillis: 5000,
  },
  notifications: {
    /** Must match `messaging_android_notification_channel_id` in `firebase.json`. */
    androidChannelId: 'default',
    androidChannelName: 'General',
  },
} as const
