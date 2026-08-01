## Context

Project MyRN đang declare Expo SDK 55 (`expo@55.0.3`, React Native `0.83.2`, React `19.2.0`) trên branch `feat/upgrade-expo-57`. Target là Expo SDK 57 với pin cứng (`expo@57.0.9`, RN `0.86.2`, React `19.2.3`).

Ràng buộc:
- Node hiện tại `v22.14.0` đạt yêu cầu SDK 57.
- Không có thư mục `ios`/`android` (Continuous Native Generation) → upgrade chủ yếu qua `package.json` / `yarn.lock` và code JS/TS.
- Convention project: **mọi dependency trong `package.json` phải là exact version** — không `^`, không `~` (kể cả `expo` và các `expo-*`).
- `openspec/config.yaml` yêu cầu artifacts tiếng Việt.
- App dùng Expo Router + custom `BottomTabBar` và custom stack `header` (`NavigationBarHeader`).
- `node_modules/expo` có thể đang lệch sang 57 trong khi `yarn.lock` còn 55 — cần `yarn install` sạch trước khi upgrade chính thức.

## Goals / Non-Goals

**Goals:**
- Nâng runtime lên Expo SDK 57 và align dependencies theo Expo bundled versions.
- Pin cứng exact version cho toàn bộ deps liên quan upgrade trong `package.json` (không range).
- Migrate hết import `@react-navigation/*` trong app code sang `expo-router`.
- Giữ hành vi tab bar (scroll-to-hide + `BottomTabBar`) và custom navigation header.
- Cập nhật tài liệu agent (`AGENTS.md`) cho đúng SDK.
- Verify bằng `expo-doctor`, lint, test.

**Non-Goals:**
- Không migrate `@gorhom/bottom-sheet` → `@expo/ui/community/bottom-sheet` trong change này.
- Không cài / tích hợp `@expo/ui` trong change này (dự kiến change riêng sau upgrade).
- Không bump các lib không gắn SDK lên latest tuyệt đối.
- Không đổi kiến trúc feature / Redux / API.
- Không bắt buộc upgrade từng bước 55→56→57 (đã chọn jump thẳng 57 theo yêu cầu).
- Không để Expo CLI giữ caret/tilde ranges trong `package.json`.

## Decisions

### 1. Jump thẳng SDK 55 → 57
- **Chọn**: cài `expo@57.0.9` rồi `npx expo install --fix`.
- **Lý do**: user yêu cầu thẳng 57; project CNG nên diff native nhỏ.
- **Alternatives**: incremental 55→56→57 (dễ pin regression hơn) — không chọn vì ngoài yêu cầu; vẫn áp dụng checklist breaking của cả 56 và 57.

### 2. Align bằng Expo CLI, sau đó pin cứng exact
- **Chọn**:
  1. `npx expo install expo@57.0.9 --fix` (hoặc tương đương) để lấy bộ version tương thích SDK 57.
  2. Chuẩn hóa `package.json`: mọi version liên quan MUST là exact (strip `^` / `~`), lấy exact từ bản Expo resolve / `yarn.lock` (ví dụ bundled `~57.0.8` → `"57.0.8"`; `^15.0.2` với package đang `15.1.1` tương thích → giữ `"15.1.1"` nếu doctor OK).
- **Lý do**: Expo CLI là source of truth cho compatibility; convention repo yêu cầu pin cứng để reproducible.
- **Alternatives**: giữ ranges Expo mặc định — bị loại vì user yêu cầu exact; pin tay trước khi biết resolve — dễ lệch peer.

### 3. Bảng pin mục tiêu (sau khi strip range từ bundled SDK 57)

| Package | Exact target (ban đầu) |
|---|---|
| `expo` | `57.0.9` |
| `expo-router` | `57.0.9` |
| `eslint-config-expo` | `57.0.1` |
| `react` / `react-dom` / `react-test-renderer` | `19.2.3` |
| `react-native` | `0.86.2` |
| `react-native-reanimated` | `4.5.1` |
| `react-native-worklets` | `0.10.1` |
| `react-native-gesture-handler` | `2.32.0` (hoặc patch `2.32.x` Expo resolve — ghi exact vào package.json) |
| `react-native-screens` | `4.26.0` |
| `react-native-safe-area-context` | `5.7.0` |
| `react-native-keyboard-controller` | `1.21.9` |
| `react-native-svg` | `15.15.4` |
| `react-native-web` | exact bản Expo resolve trong dòng `0.21.x` |
| `@shopify/react-native-skia` | `2.6.2` |
| `@shopify/flash-list` | `2.0.2` |
| `@expo/vector-icons` | exact tương thích (hiện `15.1.1` nếu doctor OK) |
| các `expo-*` còn lại | exact theo bundled sau strip `~` (vd `expo-constants` → `57.0.8`) |

Nếu `expo install --fix` resolve patch khác trong cùng dòng tương thích, ghi **exact version đã cài** vào `package.json` (không range).

### 4. Gỡ direct `@react-navigation/*` sau codemod
- **Chọn**: đổi import app → `expo-router/js-tabs` (và entry points tương ứng), rồi `yarn remove` các package direct.
- **Lý do**: SDK 56+ cấm app import `@react-navigation/*`; Expo Router fork internals.
- **Alternatives**: giữ package + `EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK=1` — chỉ là shim tạm, không dùng.

### 5. `NativeStackHeaderProps` → type tối thiểu nội bộ
- **Chọn**: định nghĩa type local chỉ gồm field đang dùng (`navigation`, `options`, …) trong `navigation-bar/type.ts`.
- **Lý do**: docs migration nói native-stack không có equivalent trực tiếp; component chỉ dùng subset nhỏ.
- **Alternatives**: phụ thuộc type nội bộ sâu của `expo-router` (dễ vỡ khi private API đổi).

### 6. Giữ `@gorhom/bottom-sheet`
- **Chọn**: giữ nguyên exact hiện tại (không range).
- **Lý do**: dùng sâu (`BottomSheetModal`, `BottomSheetTextInput`, `BottomSheetFlatList`, …); drop-in Expo UI không cover đủ API.
- **Alternatives**: migrate Expo UI — scope riêng, rủi ro UI/regression cao.

## Risks / Trade-offs

- [Jump 2 SDK khó pin regression] → Mitigate: checklist breaking SDK 56 (router) + 57 (RN 0.86); chạy doctor/lint/test/smoke.
- [Pin cứng bỏ lỡ patch tự động] → Mitigate: chấp nhận theo convention repo; nâng version chủ động khi cần.
- [`expo install` ghi lại `^`/`~`] → Mitigate: bước bắt buộc strip range / ghi exact sau khi fix.
- [`NativeStackHeaderProps` type lệch runtime props] → Mitigate: type bám đúng field đang destructure; giữ call sites `header: (props) => …`.
- [Skia 2.4→2.6 + postinstall wasm] → Mitigate: chạy lại `yarn install` / postinstall; smoke `my-spinner`.
- [Reanimated/Worklets bump + Hermes memory known issue] → Mitigate: smoke animation/swipe; ghi nhận known issue, không block upgrade.
- [`node_modules` lệch trước upgrade] → Mitigate: `yarn install` restore theo lock SDK 55 trước bước `expo install`.

## Migration Plan

1. Restore `node_modules` khớp `yarn.lock` hiện tại (`yarn install`).
2. `npx expo install expo@57.0.9 --fix`.
3. Chuẩn hóa `package.json`: bỏ mọi `^` / `~` trên deps đã đụng; ghi exact version đã resolve.
4. Gỡ `@react-navigation/bottom-tabs`, `@react-navigation/native`, `@react-navigation/elements`.
5. Chạy codemod `sdk-56-expo-router-react-navigation-replace src`; sửa tay navigation-bar types.
6. Cập nhật `AGENTS.md`.
7. `npx expo-doctor@latest`, `yarn lint`, `npx dotenv -e .env.test -- yarn test`.
8. Smoke: tab bar, custom header, bottom sheet, skia spinner, keyboard avoiding.

**Rollback**: revert commit / checkout lại `package.json` + `yarn.lock` SDK 55 và `yarn install`.

## Open Questions

- (không còn blocker) Optional bump `@gorhom/bottom-sheet` patch — mặc định **không** trừ khi doctor/peer bắt buộc; nếu bump thì vẫn exact, không range.

## Follow-up (sau change này)

- Tạo OpenSpec change riêng để adopt `@expo/ui` (bottom-sheet community drop-in + các primitive khác theo plan product).
- Khi migrate sheet: rewrite `MyBottomSheet` (bỏ custom `BottomSheetBackdrop` / `BottomSheetFooter` / handle), regression form trong sheet (`BottomSheetTextInput`, dropdown list, date/wheel picker), và chấp nhận UX native modal vs gorhom hiện tại.
- Siết lại React Compiler ESLint rules (`react-hooks/immutability`, `refs`, `set-state-in-effect`, `static-components`) đã tạm `off` vì xung đột SharedValue Reanimated — cleanup trong change lint riêng.
- Cảnh báo expo-doctor về `app.json` + `app.config.ts` (false positive / pattern sẵn có: `app.config.ts` vẫn `require('./app.json')`) — xử lý khi refactor config nếu cần.

## Hotfix đã áp dụng trong change này

- **Expo Go iOS crash (SIGSEGV)**: faulting thread `com.facebook.react.runtime.JavaScript`, stack Hermes ← `worklets::JSIWorkletsModuleProxy::toOptimizedObject`.
- **Nguyên nhân 1**: Expo tắt `inlineRequires` mặc định → Worklets JSI init sai thứ tự.
- **Fix 1**: `metro.config.js` bật `inlineRequires: true`; `babel.config.js` khai báo tường minh `react-native-worklets/plugin`.
- **Nguyên nhân 2**: Expo Go **57.0.5** ship native Worklets **0.10.0** / Reanimated **4.5.0**, trong khi `expo@57.0.9` bundled JS là **0.10.1** / **4.5.1** → mismatch JS/native (API `createSerializableNonWorkletFunction` đổi arity 3→2 giữa hai bản).
- **Fix 2**: pin `react-native-worklets@0.10.0` và `react-native-reanimated@4.5.0`; thêm vào `expo.install.exclude`.
- **Nguyên nhân 3 (IPS 12:40)**: vẫn SIGSEGV trong `createSerializableNonWorkletFunction` khi native đọc `fun.name` (`Hermes utf8FromStringView`, pointer auth failure) — bug/path lỗi trên Worklets **0.10.0** (đã rewrite ở 0.10.1 nhưng Expo Go chưa ship).
- **Fix 3**: `patch-package` bỏ truyền `fun.name` (luôn `undefined`) trong `cloneNonWorkletFunction`.
- **Fallback**: nếu vẫn crash trên Expo Go → dùng development build (`npx expo run:ios`) với Worklets **0.10.1** / Reanimated **4.5.1**.
- **Verify**: `npx expo start -c` rồi mở lại Expo Go trên Simulator.
- **KNOWN ISSUE — Bottom sheet native (deferred)**: Sau SDK 57, `@gorhom/bottom-sheet@5.2.8` + Reanimated 4.5 trên iOS/Android: `present()` không hiện sheet (web Modal vẫn OK). Đã thử snapPoints / tắt dynamic sizing / patch [PR #2720](https://github.com/gorhom/react-native-bottom-sheet/pull/2720) — **không đủ**. **Quyết định**: không chặn upgrade; rollback các thử fix trong app; track bằng GitHub issue; migrate sang **Expo UI BottomSheet** trong change follow-up (đã out-of-scope từ đầu).
