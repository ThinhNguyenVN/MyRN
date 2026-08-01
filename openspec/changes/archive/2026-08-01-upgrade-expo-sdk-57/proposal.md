## Why

Project đang ở Expo SDK 55 trong khi bản mới nhất là SDK 57 (React Native 0.86). Cần nâng SDK và căn lại dependencies tương thích để nhận runtime mới, bản vá, và tránh lệch phiên bản khi Expo Go / EAS dần ngừng hỗ trợ SDK cũ.

## What Changes

- Nâng `expo` từ `55.0.3` lên exact `57.0.9` và align toàn bộ Expo modules / peer deps theo `bundledNativeModules` của SDK 57, rồi **pin cứng mọi version trong `package.json` (không dùng `^` / `~`)**, kể cả `expo`.
- **BREAKING**: Migrate import `@react-navigation/*` trong app code sang entry points của `expo-router` (yêu cầu SDK 56+); gỡ direct dependencies `@react-navigation/bottom-tabs`, `@react-navigation/native`, `@react-navigation/elements`.
- **BREAKING**: Thay type `NativeStackHeaderProps` (không còn mapping trực tiếp) bằng type tối thiểu nội bộ cho `NavigationBarHeader`.
- Cập nhật `AGENTS.md` (SDK 55 → SDK 57).
- Không migrate `@gorhom/bottom-sheet` sang `@expo/ui` trong change này; giữ thư viện hiện tại.
- **Follow-up (ngoài change này)**: sau khi SDK 57 ổn định, sẽ có change riêng đưa `@expo/ui` vào project (bottom-sheet drop-in và các primitive Expo UI khác theo roadmap).
- Không bump các dependency không gắn SDK (axios, zod, RTK, i18n, …) trừ khi `expo-doctor` / peer bắt buộc; nếu giữ nguyên thì vẫn phải là exact version (không range).

## Capabilities

### New Capabilities

- `expo-sdk-57-runtime`: Nền tảng runtime Expo SDK 57 (React Native 0.86, React 19.2.3) với dependencies pin cứng exact; app build/start được trên iOS, Android, Web sau upgrade.
- `expo-router-navigation-imports`: App code chỉ import navigation primitives từ `expo-router` (không còn `@react-navigation/*` trực tiếp); custom tab bar và stack header vẫn hoạt động.

### Modified Capabilities

- (không có — chưa có capability hiện hữu trong `openspec/specs/` cần delta)

## Impact

- **Dependencies**: `expo`, toàn bộ `expo-*`, `eslint-config-expo`, `react` / `react-dom` / `react-test-renderer`, `react-native`, Reanimated, Worklets, Gesture Handler, Screens, Safe Area, Keyboard Controller, Skia, SVG; gỡ 3 package `@react-navigation/*`. Mọi entry trong `dependencies` / `devDependencies` liên quan upgrade MUST là exact (ví dụ `"expo": "57.0.9"`, không `"^57.0.0"`).
- **Code bắt buộc sửa**: `src/app/(public)/(tabs)/_layout.tsx`, `src/components/ui/navigation-bar/type.ts`, `src/components/ui/navigation-bar/navigation-bar-header.tsx`.
- **Docs**: `AGENTS.md`.
- **Hệ thống**: `yarn.lock`; có thể cần `yarn install` trước để sửa `node_modules` đang lệch `expo@57` trong khi lockfile còn SDK 55.
- **Ngoài scope**: migrate bottom-sheet sang Expo UI; bump unrelated libs lên latest tuyệt đối.
