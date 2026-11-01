/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging service worker (web push), served at `/firebase-messaging-sw.js`.
 * Registered by `src/services/firebase/messaging.web.ts` with the Firebase config in `?config=`.
 * Keep FIREBASE_SDK_VERSION equal to the `firebase` package version in package.json.
 */
const FIREBASE_SDK_VERSION = '12.17.1'
const OPEN_MESSAGE_TYPE = 'firebase-notification-open'
/** Read by `messaging.web.ts` on startup. */
const LAUNCH_URL_PARAM = 'notification_url'

/**
 * Opens the app shell `/` (the only page sure to exist in a static export; `/todo/42` has no HTML
 * file) and lets the app route to `data.url`. Not an in-app path → just `/`.
 */
function launchUrl(url) {
  const trimmed = typeof url === 'string' ? url.trim() : ''
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return '/'
  return `/#${LAUNCH_URL_PARAM}=${encodeURIComponent(trimmed)}`
}

// Registered before the Firebase SDK's own handler so `data.url` decides where a click goes.
self.addEventListener('notificationclick', (event) => {
  const raw = event.notification.data || {}
  const data = (raw.FCM_MSG && raw.FCM_MSG.data) || raw
  const id = (raw.FCM_MSG && raw.FCM_MSG.fcmMessageId) || event.notification.tag || undefined
  event.stopImmediatePropagation()
  event.notification.close()
  event.waitUntil(
    (async () => {
      const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true })
      const client = windows.find((w) => new URL(w.url).origin === self.location.origin)
      if (client) {
        await client.focus()
        client.postMessage({ type: OPEN_MESSAGE_TYPE, id, data })
        return
      }
      await clients.openWindow(launchUrl(data.url))
    })(),
  )
})

let config = null
try {
  config = JSON.parse(new URL(self.location.href).searchParams.get('config') || 'null')
} catch {
  config = null
}

if (config) {
  importScripts(
    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app-compat.js`,
    `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-messaging-compat.js`,
  )
  firebase.initializeApp(config)
  // Shows `notification` messages while no app tab is focused; forwards them to the page otherwise.
  firebase.messaging()
}
