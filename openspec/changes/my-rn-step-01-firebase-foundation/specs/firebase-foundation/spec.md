## ADDED Requirements

### Requirement: Firebase dùng qua một service duy nhất
App SHALL dùng Analytics, Crashlytics, Remote Config và Cloud Messaging qua `@/services/firebase`. Code trong `src/features` MUST NOT import `@react-native-firebase/*` trực tiếp.

#### Scenario: Feature log event
- **WHEN** một feature cần log event
- **THEN** nó MUST gọi `logEvent` từ `@/services/firebase` với tên event đã khai báo trong `AnalyticsEventMap`, sai tên hoặc sai params MUST báo lỗi type

### Requirement: No-op an toàn khi không có Firebase native
Trên web, trong Expo Go và trong build chưa có native code Firebase, mọi API của service SHALL là no-op: MUST NOT throw, MUST NOT chặn UI. `isFirebaseAvailable()` MUST trả `false`. Bundle web MUST NOT chứa `@react-native-firebase`.

#### Scenario: Mở app trên web
- **WHEN** app chạy trên web và code gọi `logEvent`, `recordError`, `useRemoteConfig`, `requestPushPermission`
- **THEN** app MUST chạy bình thường, `useRemoteConfig` MUST trả default, `requestPushPermission` MUST trả `'unavailable'`

#### Scenario: Lời gọi native bị lỗi
- **WHEN** một lời gọi RNFirebase throw hoặc reject
- **THEN** service MUST trả fallback và chỉ warning khi dev

### Requirement: Config native theo env, tự bật khi có file
Firebase native SHALL bật cho một env khi và chỉ khi `firebase/<env>/` có cả `google-services.json` và `GoogleService-Info.plist` (env theo `EXPO_PUBLIC_APP_ENV`). Khi bật, `app.config.ts` MUST thêm `googleServicesFile` và plugin Firebase. Khi tắt, native build MUST NOT có plugin Firebase và MUST NOT link RNFirebase, đồng thời app MUST build và chạy được với service no-op.

#### Scenario: Template chưa có Firebase project
- **WHEN** `firebase/test/` không có file và chạy `expo prebuild` + `pod install`
- **THEN** cả hai MUST thành công, Podfile MUST NOT có pod RNFB, app MUST chạy với Firebase no-op

#### Scenario: Build staging
- **WHEN** EAS build profile `staging`
- **THEN** app MUST dùng `firebase/staging/google-services.json` và `firebase/staging/GoogleService-Info.plist`

### Requirement: Init Firebase không chặn startup
Task `firebase` trong `useAppInit` SHALL chỉ đọc state local (consent, Remote Config đã activate, quyền push đã có). Fetch Remote Config và lấy FCM token MUST chạy nền; fetch MUST có timeout.

#### Scenario: Mạng chậm lúc mở app
- **WHEN** fetch Remote Config bị treo
- **THEN** splash MUST ẩn mà không chờ fetch, app MUST dùng giá trị đã cache hoặc default

### Requirement: Remote Config có type
Key và giá trị mặc định SHALL khai báo ở `src/configs/remote-config.defaults.ts`. Giá trị remote MUST được parse theo type của default. `useRemoteConfig(key)` MUST re-render khi có giá trị mới được activate.

#### Scenario: Đọc flag
- **WHEN** màn hình gọi `useRemoteConfig('sample_feature_enabled')`
- **THEN** kết quả MUST có type `boolean`, là default cho tới khi có giá trị đã activate

### Requirement: Tự động screen view và user id
App SHALL log `screen_view` theo route pattern (bỏ group, giữ `[param]`, không chứa id thật) và SHALL set/clear user id cho Analytics + Crashlytics theo user trong auth slice.

#### Scenario: Mở chi tiết todo
- **WHEN** user mở `/todo/42`
- **THEN** `screen_name` MUST là `/todo/[id]`

#### Scenario: Logout
- **WHEN** user logout
- **THEN** user id của Analytics MUST là `null` và của Crashlytics MUST là chuỗi rỗng

### Requirement: Consent thu thập dữ liệu
Analytics và Crashlytics SHALL bật theo `firebaseConfig.collectionEnabledByDefault` (mặc định `true`) khi user chưa chọn. `setCollectionEnabled(enabled)` MUST lưu lựa chọn và áp dụng cho cả hai; lần mở sau MUST áp dụng lại lựa chọn đã lưu.

#### Scenario: User tắt thu thập
- **WHEN** gọi `setCollectionEnabled(false)` rồi mở lại app
- **THEN** Analytics và Crashlytics collection MUST tắt

### Requirement: Push do product chủ động
Kit MUST NOT tự hiện prompt xin quyền. `requestPushPermission()` SHALL xin quyền và lấy token khi được cho phép. Token hiện tại và mỗi lần refresh MUST được đưa vào handler đăng ký bằng `setPushTokenHandler`. Lúc init, nếu quyền đã có thì MUST lấy token mà không prompt.

#### Scenario: Đăng ký token sau login
- **WHEN** product gọi `setPushTokenHandler(send)` và user đã cho quyền từ trước
- **THEN** `send` MUST được gọi với token hiện tại và mỗi lần token đổi

### Requirement: Hiển thị và mở push
Push lúc app ở foreground SHALL được hiển thị (iOS qua presentation options, Android qua local notification trên channel `default`). Mở push có `data.url` là path trong app (bắt đầu bằng `/`) MUST điều hướng tới path đó từ trạng thái quit, background và foreground. URL ngoài app MUST bị bỏ qua.

#### Scenario: Tap push khi app đã tắt
- **WHEN** user tap push có `data.url = "/todo/42"` lúc app đang quit
- **THEN** app MUST mở và điều hướng tới `/todo/42` đúng một lần

#### Scenario: Payload có URL ngoài
- **WHEN** push có `data.url = "https://example.com"`
- **THEN** app MUST NOT điều hướng
