## ADDED Requirements

### Requirement: ImageMessage mang mảng ảnh, tối đa 5
`ImageMessage` SHALL mang field `imageUris: string[]` (thay cho `imageUri: string` đơn lẻ) với tối thiểu 1 và tối đa 5 phần tử, cùng `caption?: string` giữ nguyên vai trò chứa text người dùng gõ kèm ảnh (không thêm field text riêng). Hệ thống MUST NOT tạo `ImageMessage` với mảng rỗng.

#### Scenario: Gửi nhiều ảnh kèm text tạo 1 ImageMessage
- **WHEN** user gửi 3 ảnh cùng đoạn text "xem giúp mình"
- **THEN** `chat.messages` MUST có thêm đúng 1 `ImageMessage` role `user` với `imageUris.length === 3` và `caption === 'xem giúp mình'`

## MODIFIED Requirements

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
