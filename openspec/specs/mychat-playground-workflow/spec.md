# mychat-playground-workflow Specification

## Purpose
Playground `chat` chứng minh workflow kit bằng `MockChatAdapter`.
## Requirements
### Requirement: Playground chat chạy được toàn bộ scripted end-to-end workflow
Playground SHALL có route `chat` dùng `MyChat` + `MockChatAdapter`, script hoá một workflow đầy đủ: text streaming → `OptionsMessage` → `FormMessage` → `ConfirmationMessage` → processing beat → `ResultMessage` kèm `MessageAction`. Route này MUST không dùng Gemini, MCP, hay bất kỳ backend thật nào.

#### Scenario: Chạy hết workflow "Tạo sản phẩm"
- **WHEN** user mở playground `chat`, gõ hoặc chọn suggestion "Tạo sản phẩm", lần lượt chọn option → điền + submit form → nhấn Tạo trên confirmation
- **THEN** cuối cùng MUST hiển thị một `ResultMessage` "✓ Đã tạo sản phẩm" kèm ít nhất 1 `MessageAction`, và toàn bộ các message trung gian MUST hiển thị ở trạng thái đã resolve (không còn button active)

### Requirement: Playground smoke cho action extension point
Playground `chat` SHALL có ít nhất 1 kịch bản demo `MessageAction` loại `external_link` (mở browser thật) và 1 kịch bản `navigate` (gọi `onAction` để điều hướng sang 1 route có sẵn trong app, ví dụ todo) để chứng minh extension point `onAction` hoạt động thật, không chỉ định nghĩa type.

#### Scenario: external_link mở browser thật
- **WHEN** user nhấn action demo loại `external_link` trong playground
- **THEN** trình duyệt (`expo-web-browser`) MUST mở, không cần playground tự xử lý qua `onAction`

#### Scenario: navigate gọi onAction điều hướng
- **WHEN** user nhấn action demo loại `navigate` trong playground
- **THEN** `onAction` của playground MUST được gọi và MUST điều hướng sang route đích thật đã có trong app (chứng minh app sở hữu navigation, không phải MyChat)

