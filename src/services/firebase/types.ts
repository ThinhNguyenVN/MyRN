// Type-only imports: they never pull the native modules into a bundle (web stays clean).
import type * as AnalyticsModule from '@react-native-firebase/analytics'
import type * as CrashlyticsModule from '@react-native-firebase/crashlytics'
import type * as MessagingModule from '@react-native-firebase/messaging'
import type * as RemoteConfigModule from '@react-native-firebase/remote-config'
import type * as NotificationsModule from 'expo-notifications'

export type FirebaseModules = {
  analytics: typeof AnalyticsModule
  crashlytics: typeof CrashlyticsModule
  messaging: typeof MessagingModule
  remoteConfig: typeof RemoteConfigModule
  /** Permission prompt + local display of foreground pushes (Android). */
  notifications: typeof NotificationsModule
}

export type FirebaseRemoteMessage = MessagingModule.RemoteMessage
