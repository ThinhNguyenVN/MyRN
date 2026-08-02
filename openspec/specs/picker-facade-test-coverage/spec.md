## Requirements

### Requirement: Unit test cho logic picker facade
Project MUST có unit test (Jest) cho logic thuần wheel helpers (wheel engine resolution theo platform, pending index, SwiftUI string-tag index resolve, commit sau Confirm). Tests MUST chạy bằng `npx dotenv -e .env.test -- yarn test` và pass trên CI.

#### Scenario: Suite picker helpers pass
- **WHEN** chạy unit test với `.env.test`
- **THEN** test file picker-engine helpers MUST pass; MUST NOT phụ thuộc native Simulator

### Requirement: Simulator / device smoke trước khi đóng change picker
Trước khi archive change picker, MUST smoke playground Date Picker và Wheel Picker (iOS và/hoặc web theo môi trường). Android SHOULD nếu có thiết bị.

#### Scenario: Playground date + wheel
- **WHEN** mở playground Date Picker và Wheel Picker sau promote
- **THEN** UI tương tác MUST hoàn tất một vòng chọn cơ bản không crash / silent no-op

### Requirement: Không để lại smoke helper tạm trong src
Mọi code tạm chỉ phục vụ automation smoke (deep-link `autoOpen`, flag auto-present, …) MUST được xóa khỏi `src/` trước khi merge.

#### Scenario: Không còn autoOpen trong src
- **WHEN** grep `autoOpen` / smoke-helper tương tự trong `src/`
- **THEN** không còn helper tạm đó trong route/component production hoặc playground ship cùng app
