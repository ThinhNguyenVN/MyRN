# mychat-conversation-engine Specification

## Purpose
`useConversation` + `ChatMessage` discriminated union, state in-memory theo session.
## Requirements
### Requirement: ChatMessage là discriminated union theo `kind`
Hệ thống SHALL định nghĩa `ChatMessage` là discriminated union theo field `kind` với các giá trị `text | image | options | confirmation | form | result | custom`, mỗi kind kế thừa `ChatMessageBase` (`id`, `role`, `createdAt`, `status`, `error?`). Hệ thống MUST NOT dùng một shape chung với payload untyped (`Record<string, unknown>`) cho phần interaction của message.

#### Scenario: Type narrowing theo kind
- **WHEN** code đọc một `ChatMessage` với `kind === 'options'`
- **THEN** TypeScript MUST narrow được type sang `OptionsMessage` và cho truy cập `options`, `selectedOptionId` mà không cần type assertion

#### Scenario: Assistant message không có kind "typing" riêng
- **WHEN** Conversation Engine tạo một assistant message mới đang chờ phản hồi
- **THEN** message MUST được tạo với `status: 'pending'` và `text` rỗng (với `kind: 'text'`), không có một `kind` riêng cho trạng thái typing

### Requirement: ConversationEvent là vocabulary tương tác của user
Hệ thống SHALL định nghĩa `ConversationEvent` là union gồm `send_text`, `send_images`, `select_option`, `confirm`, `submit_form`, `retry`, mang đủ dữ liệu để Conversation Engine build `ChatRequest` gửi cho `ChatAdapter`. Case `send_images` SHALL mang `{ type: 'send_images', imageUris: string[], caption?: string }` với `imageUris` từ 1 đến 5 phần tử.

#### Scenario: Chọn option tạo đúng event
- **WHEN** user chọn 1 option trong `OptionsMessage`
- **THEN** Engine MUST tạo `ConversationEvent` dạng `{ type: 'select_option', messageId, optionId }`

#### Scenario: Gửi nhiều ảnh tạo đúng event
- **WHEN** user gửi 2 ảnh kèm caption "abc"
- **THEN** Engine MUST tạo `ConversationEvent` dạng `{ type: 'send_images', imageUris: [uri1, uri2], caption: 'abc' }`

### Requirement: useConversation là API công khai duy nhất của Conversation Engine
Hệ thống SHALL cung cấp hook `useConversation({ adapter, initialMessages? })` trả về `{ messages, isSending, send, sendImages, selectOption, confirm, submitForm, retry }`, trong đó `sendImages: (imageUris: string[], caption?: string) => void`. Conversation Engine MUST NOT import bất kỳ module nào liên quan tới React Navigation/Expo Router, hoặc bất kỳ tên miền business (Product/Order/...) nào.

#### Scenario: Gọi send cập nhật messages
- **WHEN** component gọi `chat.send('Tạo sản phẩm')`
- **THEN** `chat.messages` MUST có thêm 1 `TextMessage` role `user` ngay lập tức (optimistic), và `chat.isSending` MUST là `true` cho tới khi adapter gọi `onDone`

#### Scenario: Gọi sendImages cập nhật messages
- **WHEN** component gọi `chat.sendImages([uri1, uri2, uri3])`
- **THEN** `chat.messages` MUST có thêm 1 `ImageMessage` role `user` với `imageUris` đúng thứ tự đã truyền, ngay lập tức (optimistic)

### Requirement: Interaction resolve là vĩnh viễn trong lịch sử
Khi user resolve một interactive message (`select_option`/`confirm`/`submit_form`), Conversation Engine SHALL cập nhật field resolve tương ứng (`selectedOptionId` / `resolution` / `submittedValues`) và set `status: 'complete'`. Sau khi resolve, message đó MUST NOT còn ở trạng thái có thể tương tác lại (không render lại button active).

#### Scenario: Chọn option xong không thể chọn lại
- **WHEN** user đã chọn "Kho chính" trong một `OptionsMessage`
- **THEN** `selectedOptionId` MUST được set và các option khác MUST NOT còn nhận tương tác chọn nữa (UI hiển thị "✓ Kho chính")

#### Scenario: Confirm xong giữ lại trong history
- **WHEN** user nhấn "Tạo" trên một `ConfirmationMessage`
- **THEN** `resolution` MUST là `'confirmed'` và message đó MUST tiếp tục xuất hiện trong `chat.messages` ở trạng thái đã resolve, không bị xoá khỏi lịch sử

### Requirement: Conversation state chỉ tồn tại in-memory trong session
`useConversation` SHALL giữ `ChatMessage[]` hoàn toàn trong React state (reducer) của session hiện tại. Hệ thống MUST NOT tự động ghi conversation vào bất kỳ storage nào (`src/utils/storage.ts` hoặc tương đương) trong phạm vi change này.

#### Scenario: Remount mất history
- **WHEN** component chứa `useConversation` unmount rồi mount lại mà không truyền `initialMessages`
- **THEN** `chat.messages` MUST bắt đầu rỗng, không tự động khôi phục từ storage

### Requirement: ImageMessage mang mảng ảnh, tối đa 5
`ImageMessage` SHALL mang field `imageUris: string[]` (thay cho `imageUri: string` đơn lẻ) với tối thiểu 1 và tối đa 5 phần tử, cùng `caption?: string` giữ nguyên vai trò chứa text người dùng gõ kèm ảnh (không thêm field text riêng). Hệ thống MUST NOT tạo `ImageMessage` với mảng rỗng.

#### Scenario: Gửi nhiều ảnh kèm text tạo 1 ImageMessage
- **WHEN** user gửi 3 ảnh cùng đoạn text "xem giúp mình"
- **THEN** `chat.messages` MUST có thêm đúng 1 `ImageMessage` role `user` với `imageUris.length === 3` và `caption === 'xem giúp mình'`

