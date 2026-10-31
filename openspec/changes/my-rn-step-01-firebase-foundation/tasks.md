## 1. Packages và native config

- [x] 1.1 Thêm `@react-native-firebase/{app,analytics,crashlytics,messaging,remote-config}@26.4.1`, `expo-dev-client`, `expo-build-properties`, `expo-notifications` (version SDK 57)
- [x] 1.2 `scripts/firebase-native.js`: xác định env và có đủ 2 file trong `firebase/<env>/` hay không
- [x] 1.3 `app.config.ts`: khi bật thì thêm `googleServicesFile`, `UIBackgroundModes`, plugin RNFB (app `disableSPM`) + `expo-notifications` + `expo-build-properties` (static frameworks, `forceStaticLinking`); `react-native.config.js` loại RNFB khỏi autolinking khi tắt
- [x] 1.4 `firebase.json` (channel Android, foreground presentation iOS); `firebase/<env>/.gitkeep` + `firebase/README.md`
- [x] 1.5 `index.ts` làm entry (`main`), đăng ký background handler trước `expo-router/entry`

## 2. Service

- [x] 2.1 `native-modules.ts` / `.web.ts`, `safe-call.ts` (`withFirebase`, `isFirebaseAvailable`)
- [x] 2.2 Analytics + `analytics-events.ts` (typed map)
- [x] 2.3 Crashlytics
- [x] 2.4 Consent (`src/configs/firebase.config.ts`)
- [x] 2.5 Remote Config + `src/configs/remote-config.defaults.ts`
- [x] 2.6 Messaging + `push-utils.ts`
- [x] 2.7 Hooks (`useFirebaseScreenTracking`, `useFirebaseUser`, `usePushNotificationNavigation`), `initFirebase`, `index.ts`

## 3. Nối vào app

- [x] 3.1 Task `firebase` trong `useAppInit`
- [x] 3.2 `FirebaseBridge` trong `src/app/_layout.tsx`

## 4. Test và docs

- [x] 4.1 Unit test: `push-utils`, `screen-name`, `remote-config`, `consent`
- [x] 4.2 `.docs/firebase-standard.md`; cập nhật `AGENTS.md`, `.docs/README.md`, `product-kickoff.md`, `folder-structure.md`
- [x] 4.3 `CHANGELOG.md` (Product to do), lời nhắc trong `create-product`

## 5. Kiểm chứng

- [x] 5.1 `yarn check:types`, `yarn lint`, `yarn lint:tokens`, `yarn check:boundaries`
- [x] 5.2 Jest `src/services/firebase` (4 suites / 14 test)
- [x] 5.3 `expo export --platform web` thành công, bundle web không chứa RNFirebase
- [x] 5.4 Không có file: `expo prebuild` + `pod install` (bản copy ở scratchpad) thành công, không có pod RNFB. Có file giả: `expo config` có đủ plugin, `googleServicesFile`, `UIBackgroundModes`, autolinking không loại gì
- [ ] 5.5 Tạo Firebase project + file config, `npx expo prebuild --clean`, build dev client iOS và Android — chờ Thịnh
- [ ] 5.6 Trên máy thật: event trong DebugView, `screen_view`, non-fatal + crash, Remote Config đổi giá trị, push foreground/background/quit + tap `data.url` — chờ Thịnh
