## ADDED Requirements

### Requirement: Unit test cho logic picker facade
Change này MUST thêm unit test (Jest) cho logic thuần wheel helpers (wheel engine resolution theo platform, pending index, SwiftUI string-tag index resolve, commit sau Confirm). Tests MUST chạy bằng `npx dotenv -e .env.test -- yarn test` và pass trên CI.

#### Scenario: Suite picker mới pass
- **WHEN** chạy unit test với `.env.test`
- **THEN** các test file mới cho picker-engine helpers MUST pass; MUST NOT phụ thuộc native Simulator

### Requirement: Simulator smoke bắt buộc trước khi đóng change
Trước khi coi implementation xong, MUST smoke trên iOS Simulator hoặc Expo Go: playground Date Picker và Wheel Picker (mở, chọn/đóng). Android SHOULD được smoke nếu môi trường có sẵn. Kết quả MUST được ghi vào tasks (checkbox).

#### Scenario: Playground date + wheel trên iOS
- **WHEN** mở playground Date Picker và Wheel Picker trên iOS sau promote/spike đạt
- **THEN** UI tương tác MUST hiện và hoàn tất một vòng chọn cơ bản không crash / silent no-op

### Requirement: Không để lại smoke helper tạm trong src
Mọi code tạm chỉ phục vụ automation smoke (deep-link `autoOpen`, flag chỉ để auto-present, v.v.) MUST được xóa khỏi `src/` trước khi merge. Docs/archive MAY ghi lại cách smoke đã làm.

#### Scenario: Không còn autoOpen trong playground production code
- **WHEN** grep `autoOpen` / smoke-helper tương tự trong `src/`
- **THEN** không còn helper tạm đó trong route/component production hoặc playground ship cùng app
