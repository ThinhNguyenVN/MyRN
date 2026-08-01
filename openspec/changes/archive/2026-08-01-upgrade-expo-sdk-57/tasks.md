## 1. Chuẩn bị môi trường

- [x] 1.1 Chạy `yarn install` để `node_modules` khớp lại `yarn.lock` SDK 55 (xử lý lệch `expo@57` nếu còn)
- [x] 1.2 Xác nhận đang ở branch `feat/upgrade-expo-57` và working tree sẵn sàng cho thay đổi upgrade

## 2. Nâng Expo SDK 57, align và pin cứng dependencies

- [x] 2.1 Chạy `npx expo install expo@57.0.9 --fix` để nâng `expo` và align bundled deps (RN, React, expo-*, reanimated, worklets, skia, …)
- [x] 2.2 Chuẩn hóa `package.json`: bỏ mọi `^` / `~` trên deps đã đụng bởi upgrade; ghi exact version đã resolve (kể cả `expo`: `"57.0.9"`)
- [x] 2.3 Chạy `yarn remove @react-navigation/bottom-tabs @react-navigation/native @react-navigation/elements`
- [x] 2.4 Kiểm tra `package.json`: `expo` exact `57.0.9`; không còn 3 direct deps `@react-navigation/*`; các Expo/RN bundled deps là exact và khớp SDK 57

## 3. Migrate Expo Router navigation imports

- [x] 3.1 Chạy `npx expo-codemod sdk-56-expo-router-react-navigation-replace src`
- [x] 3.2 Cập nhật `src/app/(public)/(tabs)/_layout.tsx`: `BottomTabBar` import từ `expo-router/js-tabs`
- [x] 3.3 Thay `NativeStackHeaderProps` bằng type tối thiểu nội bộ trong `src/components/ui/navigation-bar/type.ts`
- [x] 3.4 Cập nhật `src/components/ui/navigation-bar/navigation-bar-header.tsx` dùng type mới (vẫn đọc `navigation` / `options`)
- [x] 3.5 Xác nhận không còn import `@react-navigation/` trong `src/`

## 4. Cập nhật tài liệu

- [x] 4.1 Sửa `AGENTS.md`: Expo SDK 55 → Expo SDK 57

## 5. Kiểm tra và smoke

- [x] 5.1 Chạy `npx expo-doctor@latest` và xử lý lỗi blocking (nếu có)
- [x] 5.2 Chạy `yarn lint` và sửa lỗi liên quan upgrade
- [x] 5.3 Chạy `npx dotenv -e .env.test -- yarn test` và sửa lỗi liên quan upgrade
- [x] 5.4 Smoke thủ công (khi có thể): tab bar + scroll-to-hide, custom header/back, bottom sheet, Skia spinner, keyboard avoiding

## 6. Fix crash Expo Go (Worklets / Hermes)

- [x] 6.1 Bật `inlineRequires: true` trong `metro.config.js` (fix SIGSEGV `JSIWorkletsModuleProxy::toOptimizedObject`)
- [x] 6.2 Thêm `react-native-worklets/plugin` tường minh trong `babel.config.js`
- [x] 6.3 Pin `react-native-worklets@0.10.0` + `react-native-reanimated@4.5.0` khớp Expo Go 57.0.5 (tránh mismatch với bundled 0.10.1/4.5.1 của expo@57.0.9)
- [x] 6.4 Patch `react-native-worklets@0.10.0` (`cloneNonWorkletFunction` không truyền `fun.name`) + `patch-package` trong postinstall
- [x] 6.5 Verify trên iOS Simulator Expo Go: `npx expo start -c` rồi mở lại app (Expo Go sống sau bundle, không có `.ips` mới)

## 7. Known issue — Bottom sheet (deferred)

- [x] 7.1 Đánh giá: fix gorhom + Reanimated 4 trên Expo Go quá phức tạp / không ổn định trong scope upgrade
- [x] 7.2 Rollback thử nghiệm fix trong `MyBottomSheet` + gỡ patch `@gorhom/bottom-sheet`
- [x] 7.3 Mở GitHub issue track regression native ([#16](https://github.com/ThinhNguyenVN/MyRN/issues/16)); migrate `@expo/ui` BottomSheet ở change riêng
