import { Platform } from 'react-native'

import { firebaseConfig } from '@/configs/firebase.config'

import { logEvent } from './analytics'
import { emitForegroundMessage } from './foreground-messages'
import { emitPushToken } from './push-token'
import {
  canReceivePush,
  createNotificationOpenGuard,
  notificationOpenKey,
  resolveNotificationRoute,
  toPushPermissionStatus,
  type PushPermissionStatus,
} from './push-utils'
import { withFirebase, withFirebaseAsync } from './safe-call'
import type { FirebaseModules, FirebaseRemoteMessage, NotificationsResponse } from './types'

export { subscribeForegroundMessages, type ForegroundMessageHandler } from './foreground-messages'
export { getPushToken, setPushTokenHandler, type PushTokenHandler } from './push-token'

export type NotificationOpenHandler = (route: string | null, data: Record<string, unknown>) => void

const isAndroid = Platform.OS === 'android'
const { androidChannelId, androidChannelName, openKeyFields } = firebaseConfig.notifications

let foregroundListenersAttached = false
let initialOpenHandled = false
const shouldOpen = createNotificationOpenGuard()

function warn(label: string, error: unknown) {
  if (__DEV__) console.warn(`[firebase] ${label}`, error)
}

async function fetchToken({ messaging }: FirebaseModules) {
  // iOS registers for remote messages automatically (RNFirebase default) before a token exists.
  emitPushToken(await messaging.getToken(messaging.getMessaging()))
}

/** Android 8+: FCM and local notifications need a channel; Android 13 needs it before the prompt. */
async function ensureAndroidChannel({ notifications }: FirebaseModules) {
  if (!isAndroid) return
  await notifications.setNotificationChannelAsync(androidChannelId, {
    name: androidChannelName,
    importance: notifications.AndroidImportance.HIGH,
  })
}

/**
 * Foreground pushes: iOS shows them itself (`messaging_ios_foreground_presentation_options` in
 * `firebase.json`); Android does not, so the kit re-posts them as a local notification.
 */
function presentForegroundMessage(
  { notifications }: FirebaseModules,
  message: FirebaseRemoteMessage,
) {
  if (!isAndroid || !message.notification) return
  notifications
    .scheduleNotificationAsync({
      content: {
        title: message.notification.title ?? undefined,
        body: message.notification.body ?? undefined,
        data: { ...message.data },
      },
      trigger: { channelId: androidChannelId },
    })
    .catch((error) => warn('present foreground message failed', error))
}

function attachForegroundListeners(modules: FirebaseModules) {
  if (foregroundListenersAttached) return
  foregroundListenersAttached = true
  const { messaging, notifications } = modules
  const instance = messaging.getMessaging()

  messaging.onTokenRefresh(instance, emitPushToken)
  messaging.onMessage(instance, (message) => {
    presentForegroundMessage(modules, message)
    emitForegroundMessage(message.data)
  })

  if (isAndroid) {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    })
  }
}

export function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  return withFirebaseAsync('getPushPermissionStatus', 'unavailable', async ({ notifications }) =>
    toPushPermissionStatus(await notifications.getPermissionsAsync()),
  )
}

/**
 * Shows the OS permission prompt (once; later calls return the stored answer) and fetches the
 * FCM token when allowed. The kit never calls this on its own — ask at a moment that explains
 * why (after sign-in, onboarding step, settings toggle).
 */
export async function requestPushPermission(): Promise<PushPermissionStatus> {
  const status = await withFirebaseAsync(
    'requestPushPermission',
    'unavailable' as PushPermissionStatus,
    async (modules) => {
      await ensureAndroidChannel(modules)
      const result = toPushPermissionStatus(await modules.notifications.requestPermissionsAsync())
      if (canReceivePush(result)) await fetchToken(modules)
      return result
    },
  )
  if (status !== 'unavailable') logEvent('push_permission_result', { status })
  return status
}

/** Init: listeners + channel, and the token when permission was granted earlier. Never prompts. */
export async function initMessaging(): Promise<void> {
  await withFirebaseAsync('initMessaging', undefined, async (modules) => {
    attachForegroundListeners(modules)
    await ensureAndroidChannel(modules)
    const status = toPushPermissionStatus(await modules.notifications.getPermissionsAsync())
    if (canReceivePush(status)) await fetchToken(modules)
  })
}

/**
 * Calls `handler` when the user opens a notification: from quit state (once per launch), from
 * background, and (Android) the local copy of a foreground push.
 */
export function subscribeNotificationOpens(handler: NotificationOpenHandler): () => void {
  return withFirebase(
    'subscribeNotificationOpens',
    () => {},
    ({ messaging, notifications }) => {
      const instance = messaging.getMessaging()
      const open = (id: string | null | undefined, data: Record<string, unknown> | undefined) => {
        // expo-notifications keeps the last tap until cleared and returns it on every later
        // cold start; clear it once handled so an old push is never replayed.
        if (isAndroid) {
          try {
            notifications.clearLastNotificationResponse()
          } catch (error) {
            warn('clearLastNotificationResponse failed', error)
          }
        }
        const payload = data ?? {}
        const route = resolveNotificationRoute(payload)
        if (!shouldOpen(id, notificationOpenKey(route, payload, openKeyFields))) return
        logEvent('notification_open', { url: route ?? undefined })
        handler(route, payload)
      }
      const openResponse = (response: NotificationsResponse) =>
        open(response.notification.request.identifier, response.notification.request.content.data)

      if (!initialOpenHandled) {
        initialOpenHandled = true
        messaging
          .getInitialNotification(instance)
          .then((message) => message && open(message.messageId, message.data))
          .catch((error) => warn('getInitialNotification failed', error))
        if (isAndroid) {
          notifications
            .getLastNotificationResponseAsync()
            .then((response) => response && openResponse(response))
            .catch((error) => warn('getLastNotificationResponse failed', error))
        }
      }

      const unsubscribeRemote = messaging.onNotificationOpenedApp(instance, (message) =>
        open(message.messageId, message.data),
      )
      const localSubscription = isAndroid
        ? notifications.addNotificationResponseReceivedListener(openResponse)
        : null

      return () => {
        unsubscribeRemote()
        localSubscription?.remove()
      }
    },
  )
}

/**
 * Must run at bundle entry (`index.ts`), before the app registers: Android runs it headless
 * when a data message arrives while the app is in background or killed.
 */
export function registerBackgroundMessageHandler(
  handler: (message: FirebaseRemoteMessage) => Promise<void> = async () => {},
): void {
  withFirebase('registerBackgroundMessageHandler', undefined, ({ messaging }) => {
    messaging.setBackgroundMessageHandler(messaging.getMessaging(), handler)
  })
}
