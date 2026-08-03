## ADDED Requirements

### Requirement: Unit test bắt buộc cho mỗi component kit mới
Mỗi component trong change (`MyEmptyState`, `MyErrorState`, `MySkeleton`, `MyFormCheckbox`, `MySearchInput`, `MyDivider`, `MyCard`) MUST có unit test Jest. Ưu tiên test behavior/callback và helper thuần; dùng `@testing-library/react-native` khi cần assert render/interaction. Suite MUST chạy bằng `npx dotenv -e .env.test -- yarn test` và pass.

#### Scenario: Suite kit mới pass
- **WHEN** chạy unit test với `.env.test` sau khi thêm test files
- **THEN** mọi test của 7 components / adapters MUST pass; MUST NOT phụ thuộc Simulator

### Requirement: Smoke playground bắt buộc cho mỗi component mới
Trước khi đóng change, MUST smoke trên playground cho từng component mới (iOS Simulator/Expo Go và/hoặc web theo môi trường): mở demo, tương tác tối thiểu (CTA / retry / clear / toggle / press card), không crash. Kết quả MUST được ghi checkbox trong `tasks.md`.

#### Scenario: Smoke từng playground entry kit mới
- **WHEN** lần lượt mở các playground entry của 7 components sau promote
- **THEN** mỗi entry MUST hoàn tất một vòng tương tác cơ bản không crash / silent no-op

### Requirement: Playground catalog cho UI/element còn thiếu demo
Playground MUST có entry demo cho các shared UI/element đã có nhưng chưa có route catalog: `Collapsible`, `ImageSlider`, `MySpinner`, `MySurface`. Index/`PLAYGROUND_LINKS` MUST link tới các entry này.

#### Scenario: Mở demo Collapsible / ImageSlider / Spinner / Surface
- **WHEN** người dùng mở từng playground entry tương ứng từ catalog
- **THEN** demo MUST render được và cho phép tương tác cơ bản (mở collapsible; xem slider; thấy spinner; thấy surface elevations) không crash

### Requirement: Không để lại smoke helper tạm trong src
Mọi helper chỉ phục vụ automation smoke (`autoOpen`, deep-link auto-present, …) MUST bị xóa khỏi `src/` trước khi merge.

#### Scenario: Grep sạch autoOpen
- **WHEN** grep `autoOpen` / smoke-helper tương tự trong `src/`
- **THEN** không còn helper tạm đó trong production hoặc playground ship

### Requirement: Tuân thủ coding conventions khi implement
Implementation MUST tuân thủ `.docs/coding-conventions.md` và Cursor rules liên quan: cấu trúc `type.ts`/`styles.ts`/`index` re-export; không `!= null`; không inline handler trong JSX; theme tokens + `MySurface` elevation; prefer `My*` elements.

#### Scenario: Review convention trên PR kit
- **WHEN** review diff các folder component mới
- **THEN** không có implement trong `index.tsx`, không loose null equality, không arrow handler mới trong JSX props, styles nằm trong `styles.ts`
