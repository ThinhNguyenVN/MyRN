/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging service worker (web push), served at `/firebase-messaging-sw.js`.
 * Registered by `src/services/firebase/messaging.web.ts` with the Firebase config in `?config=`.
 * Keep FIREBASE_SDK_VERSION equal to the `firebase` package version in package.json.
 */
const FIREBASE_SDK_VERSION = '12.17.1'
const OPEN_MESSAGE_TYPE = 'firebase-notification-open'

/** Same rule as `resolveNotificationRoute`: only in-app paths. */
function toAppPath(url) {
  if (typeof url !== 'string') return '/'
  const trimmed = url.trim()
  return trimmed.startsWith('/') && !trimmed.startsWith('//') ? trimmed : '/'
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
      await clients.openWindow(toAppPath(data.url))
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
