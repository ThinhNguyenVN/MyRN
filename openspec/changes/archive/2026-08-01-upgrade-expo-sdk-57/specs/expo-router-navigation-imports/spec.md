## ADDED Requirements

### Requirement: App code không import trực tiếp @react-navigation
Mã nguồn ứng dụng dưới `src/` MUST không import từ `@react-navigation/*`. Navigation primitives dùng trong app MUST lấy từ entry points của `expo-router`.

#### Scenario: Không còn import @react-navigation trong src
- **WHEN** tìm kiếm import `@react-navigation/` trong `src/**/*.{ts,tsx}`
- **THEN** không còn kết quả nào

#### Scenario: BottomTabBar lấy từ expo-router
- **WHEN** đọc `src/app/(public)/(tabs)/_layout.tsx`
- **THEN** `BottomTabBar` MUST được import từ `expo-router/js-tabs` (hoặc entry point `expo-router` tương đương được hỗ trợ) và tab bar custom (ScrollToHideFooter) vẫn được gắn qua `tabBar`

### Requirement: Custom stack header vẫn type-safe không phụ thuộc native-stack package
`NavigationBarHeader` MUST tiếp tục nhận props stack header từ Expo Router mà không phụ thuộc `@react-navigation/native-stack`.

#### Scenario: Type header nội bộ
- **WHEN** đọc `src/components/ui/navigation-bar/type.ts` và `navigation-bar-header.tsx`
- **THEN** không còn import `NativeStackHeaderProps` từ `@react-navigation/native-stack`, và component MUST vẫn đọc được `navigation` / `options` (title, headerRight, canGoBack/goBack)

#### Scenario: Call sites header không đổi hành vi
- **WHEN** các layout dùng `header: (props) => <NavigationBarHeader {...props} />`
- **THEN** custom header MUST vẫn render title và nút back theo `navigation` / `options` như trước upgrade

### Requirement: Gỡ direct dependencies React Navigation không còn cần
`package.json` MUST không còn khai báo direct dependency cho các package `@react-navigation/*` đã thay bằng `expo-router`.

#### Scenario: package.json sạch @react-navigation direct deps
- **WHEN** đọc `dependencies` trong `package.json`
- **THEN** không còn `@react-navigation/bottom-tabs`, `@react-navigation/native`, hay `@react-navigation/elements`
