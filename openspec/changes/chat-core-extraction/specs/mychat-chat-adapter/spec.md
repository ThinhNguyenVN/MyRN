## ADDED Requirements

### Requirement: Chat session id lưu qua storage app truyền vào
Khi `HttpChatAdapterOptions.session` có giá trị, nó SHALL có dạng `{ appId, userId, storage }` với `storage: { getItem(key), setItem(key, value), removeItem(key) }` trả `Promise`. Adapter MUST đọc, ghi và xoá chat session id chỉ qua `storage` này, MUST NOT tự import cơ chế lưu trữ nào. Key MUST giữ dạng `chat.session.<appId>.<userId>` như trước change này. Nền tảng (web hay native) MUST xác định bằng `Platform.OS` của react-native.

#### Scenario: Id session đã lưu trước khi nâng cấp
- **WHEN** máy user đã lưu id session dưới key `chat.session.my-store.42` bằng bản trước, rồi app nâng lên package và truyền `storage` bọc cùng cơ chế lưu
- **THEN** lượt gửi đầu tiên MUST gửi `X-Chat-Session` bằng id đã lưu, không phải `new`

#### Scenario: Thiếu storage
- **WHEN** product truyền `session: { appId, userId }` không có `storage`
- **THEN** typecheck của product MUST thất bại

#### Scenario: Nhận session id mới
- **WHEN** stream trả `done` có `sessionId: 's1'`
- **THEN** adapter MUST gọi `storage.setItem('chat.session.<appId>.<userId>', 's1')`

## MODIFIED Requirements

### Requirement: Adapter MUST khớp bộ fixture contract của gateway
Package `chat-core` SHALL giữ một bản sao thư mục `contract/` của gateway tại `packages/chat-core/contract/` (kèm `README.md` ghi commit nguồn) và một test parse mọi file `.ndjson` trong đó qua `consumeNdjsonBuffer`. Product dùng package MUST NOT giữ bản sao `contract/` riêng. Test MUST kiểm: mỗi stream có đúng một `done` và `message` đứng trước mọi `chunk` cùng id; stream trong `v1/` MUST NOT gọi `onCardState`; stream trong `v2/` có `card_state` MUST gọi `onCardState` đúng `messageId` và `state`, trước `done`.

#### Scenario: Gateway đổi hình dạng event
- **WHEN** fixture trong `packages/chat-core/contract/` được cập nhật theo gateway và có hình dạng adapter không hiểu
- **THEN** test parse fixture MUST thất bại
