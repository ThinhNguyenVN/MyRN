# Firebase standard

Firebase (Analytics, Crashlytics, Remote Config, Cloud Messaging) is wired in this template via
`@react-native-firebase/*` and **turns on per env when its config files exist**. Product code
imports only from `@/services/firebase` and never changes when Firebase is turned on.

| Runtime | Behaviour |
|---------|-----------|
| Native build, `firebase/<env>/` has both files | Real Firebase |
| Native build, files missing (template, new product) | No-op — no Firebase plugins, RNFirebase not linked |
| Web | No-op (`native-modules.web.ts`; RNFirebase is not in the web bundle) |
| Expo Go, or a build made before Firebase was added | No-op (`isFirebaseAvailable()` is `false`) |

Every call is safe in a no-op runtime: it never throws and never blocks the UI. Native features
need a **dev client** (`expo-dev-client` is installed): `npx expo run:ios` / `run:android`, or an
EAS `development` build. Expo Go still opens the app, without Firebase.

## Setup for a new product

1. Create one Firebase project per env (`test`, `staging`, `production`).
2. In each project, add an iOS app with `template.config.json → bundleId` and an Android app with
   `packageName`. Enable Analytics when creating the project.
3. Download the files into `firebase/<env>/`:
   `google-services.json` and `GoogleService-Info.plist`. Commit them (client config, not secrets).
4. iOS push: upload an APNs auth key (`.p8`) in Firebase → Project settings → Cloud Messaging.
   EAS adds the Push Notifications capability when credentials are set up.
5. `npx expo prebuild --clean` (or an EAS build) and run on a device.

Nothing else to switch on. `scripts/firebase-native.js` decides per env (from
`EXPO_PUBLIC_APP_ENV`: `yarn start` / local `run:*` = `test`, EAS profiles set it in `eas.json`)
whether `firebase/<env>/` has **both** files, and two places follow it:

- `app.config.ts` adds `googleServicesFile`, `UIBackgroundModes: ["remote-notification"]` and the
  plugins `@react-native-firebase/{app,analytics,crashlytics,messaging}` (app with
  `ios.disableSPM`), `expo-notifications`, `expo-build-properties` (iOS `useFrameworks: "static"`
  + `forceStaticLinking` for the RNFB pods).
- `react-native.config.js` removes the 5 RNFirebase packages from autolinking when the files are
  missing (their pods fail `pod install` without the Firebase Podfile setup).

Only one of the two files → warning, Firebase stays off. After adding or removing files, rebuild
native (`npx expo prebuild --clean`).

Other native config:

- `firebase.json`: RNFirebase native flags (Android notification channel, iOS foreground
  presentation). Add `analytics_auto_collection_enabled` / `crashlytics_auto_collection_enabled:
  false` here when collection must be off before JS starts (see Consent).
- `index.ts` (package `main`): registers the background message handler, then loads
  `expo-router/entry`.

## Wiring the kit already does

- `useAppInit` task `firebase` → `initFirebase()`: applies the stored consent, reads cached Remote
  Config, attaches push listeners and fetches the FCM token **only if permission was already
  granted**. Network work runs in the background; the splash never waits for it.
- `FirebaseBridge` in `src/app/_layout.tsx`:
  - `useFirebaseScreenTracking()` logs `screen_view` per route pattern (`/todo/[id]`, groups
    removed, ids never logged).
  - `useFirebaseUser(userId)` sets/clears the Analytics + Crashlytics user id from the auth slice.
  - `usePushNotificationNavigation()` routes to `data.url` when a push is opened.
- Fatal JS errors and native crashes go to Crashlytics automatically.

## Analytics

```ts
import { logEvent } from '@/services/firebase'

logEvent('order_placed', { order_id: order.id, value: order.total })
```

Events are typed by `AnalyticsEventMap`. Add product events with declaration merging in a
feature file (do not edit the kit file):

```ts
// src/features/orders/analytics-events.ts
declare module '@/services/firebase/analytics-events' {
  interface AnalyticsEventMap {
    order_placed: { order_id: string; value: number }
    cart_cleared: undefined // no params
  }
}
export {}
```

Rules: snake_case names ≤ 40 chars, no reserved GA4 names (`screen_view`, `first_open`,
`session_start`, ...), ≤ 25 params, string values ≤ 100 chars. No PII (email, phone, name) in
events or user properties.

## Crashlytics

```ts
import { recordError, crashLog } from '@/services/firebase'

try {
  await syncCart()
} catch (error) {
  recordError(error, 'cart sync') // non-fatal; context becomes a breadcrumb
}
crashLog('checkout: payment sheet opened')
```

Record only errors you handle and want to see (unexpected failures), not validation errors or
expected 4xx responses.

## Remote Config

1. Declare the key and its default in `src/configs/remote-config.defaults.ts`. The default's type
   (boolean / number / string) decides how the remote value is parsed.
2. Create the same key in the Firebase console.
3. Read it:

```ts
import { useRemoteConfig, getRemoteConfigValue } from '@/services/firebase'

const isNewCheckout = useRemoteConfig('new_checkout_enabled') // re-renders after a fetch
const minVersion = getRemoteConfigValue('min_supported_app_version') // outside React
```

Startup uses defaults + the last activated (cached) values; a background fetch
(`firebaseConfig.remoteConfig`: interval 1h in release / 0 in dev, timeout 5s) activates new values
and updates hooks. So a value changed in the console reaches the user on the next fetch, and the
first screen of the first launch always sees defaults — pick safe defaults.

## Cloud Messaging (push)

The kit never shows the permission prompt on its own. Ask when the user understands why:

```ts
import { requestPushPermission, setPushTokenHandler } from '@/services/firebase'

// once, e.g. in the auth feature after sign-in
const unsubscribe = setPushTokenHandler((token) => registerDeviceToken({ token }))

// from an onboarding step or a settings toggle
const status = await requestPushPermission() // 'granted' | 'provisional' | 'denied' | 'undetermined' | 'unavailable'
```

- `setPushTokenHandler` is called with the current token (if any) and on every refresh — send it
  to your backend for the signed-in user. On sign-out, tell your backend to drop the token.
- Display: background/quit pushes are shown by the OS. Foreground: iOS shows them
  (`firebase.json` presentation options); Android re-posts them as a local notification
  (`expo-notifications`, channel `firebaseConfig.notifications.androidChannelId`).
- Open: a push with `data.url = "/orders/42"` navigates there (from quit, background or
  foreground). Only in-app paths starting with `/` are accepted. Use `subscribeNotificationOpens`
  for custom handling.
- Data-only messages in background: pass a handler to `registerBackgroundMessageHandler` in
  `index.ts`. Keep it short (no UI, no navigation).
- Test: Firebase console → Messaging → "Send test message" with the token from
  `getPushToken()`, plus custom data `url`.

## Consent

Collection (Analytics + Crashlytics) is on by default
(`firebaseConfig.collectionEnabledByDefault`). For opt-in products (GDPR):

1. Set `collectionEnabledByDefault: false`.
2. Add to `firebase.json` → `react-native`: `"analytics_auto_collection_enabled": false` and
   `"crashlytics_auto_collection_enabled": false` (so nothing is sent before JS runs).
3. Call `setCollectionEnabled(true | false)` from your consent UI; the choice is stored.

iOS App Tracking Transparency is not part of the kit (Analytics works without IDFA).

## Do / don't

- Do import from `@/services/firebase` only; never import `@react-native-firebase/*` in features.
- Do keep `firebase/<env>/` files in sync with `template.config.json` ids.
- Don't block init or a screen on Remote Config fetch or token fetch.
- Don't add a second screen tracker; the bridge already logs `screen_view`.
- Don't run push/crash testing in Expo Go — use a dev client.
- Don't move the Firebase plugins into `app.json`: they must stay conditional in `app.config.ts`.
