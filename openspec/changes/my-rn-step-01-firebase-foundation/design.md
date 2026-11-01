## Context

- Expo SDK 57, RN 0.86, expo-router, Redux auth slice (`selectAuthUser`), `useAppInit` chạy các task song song trước khi ẩn splash (native). App build cả web (static export).
- Ba env `test` / `staging` / `production` chọn qua `EXPO_PUBLIC_APP_ENV` (`app.config.ts`, `eas.json`). Bundle id/package lấy từ `template.config.json`, giống nhau giữa các env.
- Chưa có `expo-dev-client`; `ios/` và `android/` được gitignore (CNG).

## Goals / Non-Goals

**Goals:** product mới có Firebase chạy ngay sau khi bỏ file config vào; product code không phải rẽ nhánh theo platform/runtime; telemetry không bao giờ làm crash hay chậm startup; my-store sync được bằng cách copy theo CHANGELOG.

**Non-Goals:** Remote Config realtime, UI consent/ATT/xin quyền, playground debug, Crashlytics thật trên web (Firebase không có).

## Decisions

### D1. Native dùng RNFirebase, web dùng Firebase JS SDK

Crashlytics và FCM native chỉ có ở RNFirebase. Web dùng Firebase JS SDK (xem D10). Đánh đổi: cần dev client. Chọn `26.4.1` vì `27.x` phụ thuộc `firebase@13` (yêu cầu Node ≥ 24).

### D2. Một điểm tách runtime: `native-modules.ts` / `.web.ts`

`loadFirebase()` trả về các module native (require lazy) hoặc `null`: web (file `.web.ts`, RNFirebase không vào bundle), Expo Go (`ExecutionEnvironment.StoreClient`), require lỗi, hoặc `getApp()` throw (JS package có nhưng native RNFB chưa link; `require` tự nó không throw). `expo-notifications` cũng load qua đây. Mọi service gọi qua `withFirebase` / `withFirebaseAsync`: không có module hoặc lời gọi throw thì trả về fallback, chỉ `console.warn` khi dev. Web không đi qua `loadFirebase` (luôn `null`): các service có bản `*.web.ts` riêng (D10).

### D3. Tự bật khi có file config

`scripts/firebase-native.js` là nguồn duy nhất: env (cùng luật với `app.config.ts`) và `firebase/<env>/` có đủ `google-services.json` + `GoogleService-Info.plist` thì mới bật.

- Có đủ 2 file: `app.config.ts` thêm `googleServicesFile`, `UIBackgroundModes`, plugin RNFB (app với `ios.disableSPM: true`, vì SPM + static linkage làm `pod install` fail), `expo-notifications`, `expo-build-properties`. `react-native.config.js` không loại gì.
- Không có file: không thêm plugin; `react-native.config.js` set `platforms: { ios: null, android: null }` cho 5 package RNFB. Đã kiểm: thiếu bước này thì `pod install` fail ngay cả khi không có plugin, vì pod RNFB autolink và gặp lỗi "SPM + static linkage". JS vẫn require được package, nên `loadFirebase` gọi thử `getApp()`: native chưa link thì throw, cache `null`, `isFirebaseAvailable()` là `false`.
- Chỉ có 1 file: warning, vẫn tắt.

Lý do: Firebase project tạo riêng cho từng product sau, nên template phải build được khi chưa có project. File config được commit vì đây là client config, không phải secret.

Phương án cũ (bỏ): plugin luôn nằm trong `app.json`, nên template không có file config thì native build fail.

### D4. Init không chặn

Task `firebase` chỉ đọc state local: consent đã lưu, Remote Config đã activate (`ensureInitialized`), quyền đã có thì mới lấy token (`initMessaging` chạy nền). `fetchAndActivate` chạy nền, không await, không bọc timeout JS: timeout là setting native `fetchTimeoutMillis`. Fetch xong (kể cả muộn) thì cập nhật store và hook re-render. Giá trị number từ remote rỗng/không phải số thì giữ default (`asNumber()` trả `0` nên parse từ `asString()`). Lần mở đầu tiên luôn thấy defaults.

### D5. Typed events bằng declaration merging

`AnalyticsEventMap` (interface) ở `analytics-events.ts`. Product thêm event trong file của feature bằng `declare module '@/services/firebase/analytics-events'`, không sửa file kit nên sync không bị conflict.

### D6. Remote Config: type theo default

`remote-config.defaults.ts` (trong `src/configs`, product sửa) là nguồn key và type. `parseRemoteValues` đọc boolean/number/string theo type của default; number không hợp lệ thì về default. Store nhỏ + `useSyncExternalStore`.

### D7. Push

- Quyền: `expo-notifications` (API permission của RNFirebase đã deprecated). Kit không tự xin quyền.
- Hiển thị foreground: iOS dùng `messaging_ios_foreground_presentation_options` trong `firebase.json` (OS tự hiện); Android re-post local notification qua `expo-notifications` trên channel `default` (trùng `messaging_android_notification_channel_id`).
- Service FCM Android: service của `expo-notifications` có `priority=-1`, nên RNFirebase nhận message.
- Mở thông báo: `getInitialNotification` (quit), `onNotificationOpenedApp` (background), Android thêm response listener của `expo-notifications` cho bản local. Một tap có thể được nhiều nguồn báo: `createNotificationOpenGuard` cho qua mỗi tap 1 lần (trùng notification id, hoặc trùng payload trong 2s). Android: sau mỗi lần mở gọi `clearLastNotificationResponse()`, vì `getLastNotificationResponseAsync()` giữ tap cuối tới khi clear và nếu không sẽ replay ở mọi cold start sau. Chỉ nhận `data.url` là path trong app (bắt đầu bằng `/`, không phải `//`).
- Background handler đăng ký trong `index.ts` trước `expo-router/entry`. Entry load bằng `require` sau lời gọi, vì `import` bị hoist và evaluate trước thân module.

### D8. Screen tracking theo route pattern

`useSegments()` bỏ group `(…)` → `/todo/[id]`. `screen_name` ít giá trị khác nhau và không lộ id.

### D9. Thư mục `src/services/`

Tích hợp SDK dùng toàn app, không có UI. Ghi vào `folder-structure.md`. Feature chỉ import `@/services/firebase`.

### D10. Firebase trên web (chốt 01/11, thay "web no-op")

- **SDK:** `firebase@12.17.1`, đúng bản RNFirebase đã kéo theo (không có 2 bản). Chỉ các file `*.web.ts` import `web-sdk.ts`; `web-sdk.ts` load `firebase/*` bằng dynamic `import()` nên bundle native không có JS SDK, bundle web tách chunk lazy. tsc resolve import theo file native (`moduleSuffixes`), nên helper chỉ-web nằm trong `web-sdk.ts` (không hậu tố).
- **Bật theo env:** `firebase/<env>/firebase-web.json` (`firebaseConfig` của web app + `vapidKey` tuỳ chọn). `scripts/firebase-native.js` báo `webEnabled`, `app.config.ts` đưa vào `extra.firebaseWeb`, `web-sdk.ts` đọc qua `expo-constants`. Không có file hoặc đang static render (`window` undefined) → `null`, service no-op. Manifest được babel inline vào bundle, nên sau khi thêm/sửa file phải `expo start --clear`.
- **Tách phần dùng chung:** store Remote Config + hook (`remote-config.ts`) dùng chung, nguồn dữ liệu tách ra `remote-config-source.ts` / `.web.ts` (API modular của RNFirebase và JS SDK giống nhau); token push ở `push-token.ts`; consent lưu ở `consent-store.ts`, áp dụng ở `collection.ts` / `.web.ts`.
- **Analytics:** GA4 (`measurementId` bắt buộc; project chưa liên kết Google Analytics thì Analytics web tắt). `screen_view` gửi `firebase_screen`. Consent: đặt `window['ga-disable-<measurementId>']` trước khi Analytics load.
- **Lỗi:** web không có Crashlytics. `recordError` và lỗi global (`error`, `unhandledrejection`, tối đa 20/phiên) gửi event `exception` (`description` ≤ 100 ký tự, `fatal`). `crashLog`, `setCrashUserId` là no-op.
- **Push:** service worker `public/firebase-messaging-sw.js` (scope `/firebase-cloud-messaging-push-scope`, không điều khiển trang app), dùng Firebase compat SDK từ gstatic cùng version, config qua query `?config=` (client config). Chờ worker `activated` rồi mới `getToken` (không thì `PushManager.subscribe` fail). Foreground: trang tự `showNotification` qua registration. Click: handler của app đăng ký trước SDK, focus tab và `postMessage` data về trang (→ `subscribeNotificationOpens`), không có tab thì mở `data.url`. `requestPushPermission` gọi `Notification.requestPermission()` trước mọi `await` để giữ user gesture. iOS Safari chỉ có push khi web đã Add to Home Screen; trình duyệt không hỗ trợ → `'unavailable'`.

## Risks / Trade-offs

- iOS static frameworks + `forceStaticLinking` cho pod RNFB: theo hướng dẫn RNFirebase cho Expo; chưa prebuild iOS để kiểm.
- iOS delegate thông báo bị chia giữa RNFirebase và `expo-notifications`: trên iOS kit chỉ dùng `expo-notifications` để xin quyền; hiển thị và tap đều do RNFirebase xử lý.
- Collection mặc định bật: product cần GDPR phải đổi config và thêm cờ native trong `firebase.json` (có ghi trong doc).
- Web: service worker tải SDK từ gstatic, version phải khớp `firebase` trong `package.json` (ghi trong file). Mở từ thông báo khi chưa có tab: route mở trực tiếp, không log `notification_open`.
