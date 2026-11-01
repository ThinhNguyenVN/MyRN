/**
 * Web push (FCM JS SDK). Needs HTTPS (or localhost) and `public/firebase-messaging-sw.js`.
 * - Background/closed tab: the service worker shows the notification.
 * - Foreground: the page re-posts it through the service worker so it looks the same.
 * - Click: the service worker focuses the app and posts `data` back here, or opens `/` with the
 *   route in `#notification_url=` (only `/` is sure to exist in a static export).
 * iOS Safari supports push only for a web app added to the home screen; elsewhere it is
 * `'unavailable'`.
 */
import { logEvent } from './analytics'
import { emitPushToken } from './push-token'
import {
  canReceivePush,
  createNotificationOpenGuard,
  resolveNotificationRoute,
  toWebPushPermissionStatus,
  type PushPermissionStatus,
} from './push-utils'
import type { FirebaseRemoteMessage } from './types'
import { getWebFirebaseConfig, getWebMessaging, warnWeb } from './web-sdk'

export { getPushToken, setPushTokenHandler, type PushTokenHandler } from './push-token'

export type NotificationOpenHandler = (route: string | null, data: Record<string, unknown>) => void

/** Message type the service worker posts when a notification is clicked. */
const OPEN_MESSAGE_TYPE = 'firebase-notification-open'
/** Query param the worker adds to `/` when a click opens the app (same name in the worker). */
const LAUNCH_URL_PARAM = 'notification_url'
/** Same scope as the Firebase default, so the worker never controls the app's pages. */
const SW_SCOPE = '/firebase-cloud-messaging-push-scope'

const shouldOpen = createNotificationOpenGuard()
let foregroundListenerAttached = false
let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

function hasNotificationApi(): boolean {
  return typeof window !== 'undefined' && typeof Notification !== 'undefined'
}

/**
 * `PushManager.subscribe` (inside `getToken`) fails until the worker is active. The worker has
 * its own scope, so `navigator.serviceWorker.ready` (page scope) never resolves for it.
 */
function waitUntilActive(
  registration: ServiceWorkerRegistration,
): Promise<ServiceWorkerRegistration> {
  const worker = registration.installing ?? registration.waiting
  if (registration.active || !worker) return Promise.resolve(registration)
  return new Promise((resolve, reject) => {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') resolve(registration)
      if (worker.state === 'redundant') reject(new Error('service worker became redundant'))
    })
  })
}

/** The worker reads the Firebase config from its URL (client config, not a secret). */
function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  registrationPromise ??= (async () => {
    const config = getWebFirebaseConfig()
    if (!config || !('serviceWorker' in navigator)) return null
    const { vapidKey: _vapidKey, ...options } = config
    const url = `/firebase-messaging-sw.js?config=${encodeURIComponent(JSON.stringify(options))}`
    return waitUntilActive(await navigator.serviceWorker.register(url, { scope: SW_SCOPE }))
  })().catch((error) => {
    warnWeb('service worker registration failed', error)
    registrationPromise = null
    return null
  })
  return registrationPromise
}

let tokenRequest: Promise<void> | null = null

/**
 * One `getToken` at a time: init and `requestPushPermission` can overlap, and two concurrent
 * calls make the SDK delete the token it just created and register a new one.
 */
function fetchToken(): Promise<void> {
  tokenRequest ??= (async () => {
    const [messaging, registration] = await Promise.all([getWebMessaging(), getRegistration()])
    if (!messaging || !registration) return
    const { getToken } = await import('firebase/messaging')
    const vapidKey = getWebFirebaseConfig()?.vapidKey
    emitPushToken(
      await getToken(messaging, {
        serviceWorkerRegistration: registration,
        ...(vapidKey && { vapidKey }),
      }),
    )
  })().finally(() => {
    tokenRequest = null
  })
  return tokenRequest
}

async function attachForegroundListener(): Promise<void> {
  if (foregroundListenerAttached) return
  const messaging = await getWebMessaging()
  if (!messaging) return
  foregroundListenerAttached = true
  const { onMessage } = await import('firebase/messaging')
  onMessage(messaging, (payload) => {
    const notification = payload.notification
    if (!notification) return
    void getRegistration()
      .then((registration) =>
        registration?.showNotification(notification.title ?? '', {
          body: notification.body,
          icon: notification.icon,
          data: { ...payload.data },
        }),
      )
      .catch((error) => warnWeb('present foreground message failed', error))
  })
}

async function isPushSupported(): Promise<boolean> {
  return hasNotificationApi() && (await getWebMessaging()) !== null
}

export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  if (!(await isPushSupported())) return 'unavailable'
  return toWebPushPermissionStatus(Notification.permission)
}

/**
 * Shows the browser permission prompt and fetches the FCM token when allowed. Call it from a
 * click handler: browsers ignore the prompt without a user gesture, so the prompt is requested
 * before any other `await`.
 */
export async function requestPushPermission(): Promise<PushPermissionStatus> {
  if (!hasNotificationApi() || !getWebFirebaseConfig()) return 'unavailable'
  let status: PushPermissionStatus
  try {
    status = toWebPushPermissionStatus(await Notification.requestPermission())
    if (!(await isPushSupported())) return 'unavailable'
    if (canReceivePush(status)) {
      await attachForegroundListener()
      await fetchToken()
    }
  } catch (error) {
    warnWeb('requestPushPermission failed', error)
    return 'unavailable'
  }
  logEvent('push_permission_result', { status })
  return status
}

/** Init: foreground listener, and the token when permission was granted earlier. Never prompts. */
export async function initMessaging(): Promise<void> {
  try {
    if ((await getPushPermissionStatus()) !== 'granted') return
    await attachForegroundListener()
    await fetchToken()
  } catch (error) {
    warnWeb('initMessaging failed', error)
  }
}

let launchChecked = false

/**
 * A click with no app tab open makes the worker open `/#notification_url=<path>`: only `/` is
 * sure to exist in a static export (`/todo/42` has no HTML file). Reads the param once, removes
 * it from the address bar, and returns the payload to open (`null` = not a notification launch).
 */
function takeLaunchPayload(): Record<string, unknown> | null {
  if (launchChecked || typeof window === 'undefined') return null
  launchChecked = true
  // In the hash, not the query: expo-router would treat a query as a route param of `/`.
  const params = new URLSearchParams(window.location.hash.slice(1))
  if (!params.has(LAUNCH_URL_PARAM)) return null
  const payload = { url: params.get(LAUNCH_URL_PARAM) ?? '' }
  const { pathname, search } = window.location
  window.history.replaceState(window.history.state, '', pathname + search)
  return payload
}

/**
 * Calls `handler` when the user clicks a notification: while the app is open in a tab (the
 * worker posts the click here), or once on startup when the click opened the app.
 */
export function subscribeNotificationOpens(handler: NotificationOpenHandler): () => void {
  if (!getWebFirebaseConfig() || typeof navigator === 'undefined' || !navigator.serviceWorker) {
    return () => {}
  }
  const open = (id: string | undefined, payload: Record<string, unknown>) => {
    const route = resolveNotificationRoute(payload)
    if (!shouldOpen(id, route)) return
    logEvent('notification_open', { url: route ?? undefined })
    handler(route, payload)
  }
  const launchPayload = takeLaunchPayload()
  // Next tick: the subscriber mounts inside the router; navigate after it has mounted.
  if (launchPayload) setTimeout(() => open(undefined, launchPayload), 0)

  const onMessage = (event: MessageEvent) => {
    const message = event.data as { type?: string; id?: string; data?: Record<string, unknown> }
    if (message?.type !== OPEN_MESSAGE_TYPE) return
    open(message.id, message.data ?? {})
  }
  navigator.serviceWorker.addEventListener('message', onMessage)
  return () => navigator.serviceWorker.removeEventListener('message', onMessage)
}

/** Web: background messages are handled by the service worker; nothing to register here. */
export function registerBackgroundMessageHandler(
  _handler?: (message: FirebaseRemoteMessage) => Promise<void>,
): void {}
