## ADDED Requirements

### Requirement: Runtime khớp Expo SDK 57
Project MUST chạy trên Expo SDK 57 với React Native và React versions do Expo 57 bundled quy định.

#### Scenario: Phiên bản core đã nâng và pin cứng
- **WHEN** đọc `package.json` sau upgrade
- **THEN** `expo` MUST là exact `"57.0.9"` (không `^` / `~`), `react-native` MUST là exact `"0.86.2"`, và `react` / `react-dom` MUST là exact `"19.2.3"`

#### Scenario: Expo modules đã align và pin cứng
- **WHEN** đọc các dependency Expo / bundled trong `package.json` và chạy `npx expo install --check` (hoặc tương đương)
- **THEN** các package đó MUST khớp SDK 57 và mọi version khai báo MUST là exact (không chứa ký tự `^` hoặc `~`)

### Requirement: package.json không dùng semver range cho dependencies đã quản lý
Mọi entry trong `dependencies` và `devDependencies` bị đụng bởi upgrade này MUST dùng exact version string.

#### Scenario: Không còn caret hoặc tilde trên deps upgrade
- **WHEN** quét `package.json` cho các package thuộc nhóm upgrade (`expo`, `expo-*`, `eslint-config-expo`, `react`, `react-dom`, `react-test-renderer`, `react-native`, và các RN peer Expo bundled đã liệt kê trong design)
- **THEN** không còn giá trị version bắt đầu bằng `^` hoặc `~`

### Requirement: Công cụ kiểm tra sau upgrade phải pass
Sau khi nâng SDK, các bước kiểm tra chuẩn của project MUST chạy thành công (hoặc chỉ còn cảnh báo đã được ghi nhận có chủ đích).

#### Scenario: expo-doctor không chặn
- **WHEN** chạy `npx expo-doctor@latest`
- **THEN** không còn lỗi dependency/SDK blocking việc tiếp tục develop trên SDK 57

#### Scenario: lint và test project
- **WHEN** chạy `yarn lint` và `npx dotenv -e .env.test -- yarn test`
- **THEN** cả hai lệnh MUST kết thúc thành công

### Requirement: Tài liệu agent phản ánh SDK hiện tại
`AGENTS.md` MUST mô tả đúng Expo SDK đang dùng sau upgrade.

#### Scenario: AGENTS.md cập nhật SDK
- **WHEN** đọc phần mô tả runtime trong `AGENTS.md`
- **THEN** nội dung MUST ghi Expo SDK 57 (không còn SDK 55)
