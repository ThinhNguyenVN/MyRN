## Why

my-rn là template để khởi tạo product (my-store và các app sau). Hiện template chưa có Analytics, crash reporting, feature flag hay push notification. Product nào cần cũng phải tự setup Firebase từ đầu: chọn SDK, config native theo env, nối init, theo dõi screen, gắn user id, xử lý token và deep link. Mỗi product làm một kiểu thì không sync ngược về my-rn được.

Thịnh chốt (31/10, interview trong session Claude Code): dựng sẵn bộ khung Firebase trong my-rn để product mới có sẵn và my-store sync về qua `CHANGELOG.md`. Firebase project tạo riêng cho từng product sau; template và product chưa có project vẫn phải build được (Thịnh chốt lại cùng ngày: **tự bật khi có file config**, thay cho "bật cứng").

## What Changes

- **SDK:** `@react-native-firebase/{app,analytics,crashlytics,messaging,remote-config}` `26.4.1` (modular API). Bản 27 kéo Firebase JS SDK 13 cần Node ≥ 24, máy dev đang chạy Node 22.
- **Service `src/services/firebase/`** (thư mục `src/services` mới): API có type, mọi lời gọi là no-op an toàn trên web (`.web.ts`), trong Expo Go và trong build chưa có native code Firebase.
  - Analytics: `logEvent` có type theo `AnalyticsEventMap` (product mở rộng bằng declaration merging), `logScreenView`, `setAnalyticsUserId`.
  - Crashlytics: `recordError`, `crashLog`, `setCrashUserId`.
  - Consent: `setCollectionEnabled` / `getCollectionEnabled`, mặc định bật, có lưu lựa chọn.
  - Remote Config: defaults có type ở `src/configs/remote-config.defaults.ts`, `useRemoteConfig(key)`, `getRemoteConfigValue(key)`; fetch chạy nền, không chặn init.
  - Messaging: product tự gọi `requestPushPermission()`, lấy token + refresh qua `setPushTokenHandler`, background handler, Android foreground hiện local notification (`expo-notifications`), tap vào push có `data.url` thì điều hướng bằng expo-router.
- **Nối vào app:** task `firebase` trong `useAppInit`; `FirebaseBridge` trong root layout (auto `screen_view`, user id theo auth slice, push → route).
- **Native:** Firebase bật theo env khi `firebase/<env>/` có đủ 2 file (`scripts/firebase-native.js`). Khi đó `app.config.ts` thêm plugin RNFB, `expo-notifications`, `expo-build-properties` (iOS static frameworks), còn `react-native.config.js` thôi loại RNFirebase khỏi autolinking. Khi không có file thì native build không có Firebase; `firebase.json`; `index.ts` làm entry (package `main`) để đăng ký background handler; thêm `expo-dev-client`.
- **Docs và sync:** `.docs/firebase-standard.md`, cập nhật `AGENTS.md`, `.docs/README.md`, `product-kickoff.md`, `folder-structure.md`, `CHANGELOG.md` (có Product to do), lời nhắc trong `create-product`.

Không làm trong change này: Firebase trên web (JS SDK), Remote Config realtime, UI consent hay ATT, UI xin quyền push, playground debug screen, gửi token lên backend (product tự làm).

## Capabilities

### New Capabilities

- `firebase-foundation`: service Firebase dùng chung, hành vi no-op, init không chặn, config native theo env, typed events/flags, luồng push.

## Impact

- **Code:** `package.json` (`main`, dependencies), `app.config.ts`, `react-native.config.js`, `scripts/firebase-native.js`, `firebase.json`, `index.ts`, `firebase/`, `src/services/firebase/**`, `src/configs/firebase.config.ts`, `src/configs/remote-config.defaults.ts`, `src/hooks/app-init-hooks.ts`, `src/app/_layout.tsx`, `scripts/create-product-from-kit.js`, docs.
- **DX:** native chạy bằng dev client; Expo Go vẫn mở được app nhưng Firebase là no-op.
- **Việc Thịnh làm:** tạo Firebase project cho 3 env, bỏ file vào `firebase/<env>/`, upload APNs key, build dev client và test trên máy thật.
- **Rủi ro:** (1) iOS `useFrameworks: static` có thể ảnh hưởng pod khác (reanimated/worklets, keyboard-controller), chỉ biết khi prebuild iOS; (2) `expo-notifications` và RNFirebase messaging cùng đăng ký delegate thông báo trên iOS, cần test tap/foreground trên máy thật; (3) chưa có Firebase project nên chưa verify native.
