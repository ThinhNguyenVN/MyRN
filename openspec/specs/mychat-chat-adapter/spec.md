# mychat-chat-adapter Specification

## Purpose
`ChatAdapter` + `MockChatAdapter` + HTTP NDJSON streaming — không coupling Gemini/MCP.
## Requirements
### Requirement: ChatAdapter là interface provider-agnostic
Hệ thống SHALL định nghĩa `ChatAdapter { send(request: ChatRequest, handlers: ChatStreamHandlers): Promise<void>; cancel?(messageId: string): void }` và `ChatStreamHandlers { onMessageStart, onTextChunk, onMessage, onCardState, onError, onDone }`. Định nghĩa các type này MUST NOT tham chiếu tới bất kỳ khái niệm nào của một provider AI cụ thể (Gemini, OpenAI, tool call, MCP).

#### Scenario: Interface không rò rỉ provider
- **WHEN** review type `ChatAdapter`, `ChatRequest`, `ChatStreamHandlers`
- **THEN** không có field/type nào đặt tên hoặc tham chiếu Gemini/OpenAI/MCP/tool-call

### Requirement: MockChatAdapter script hoá streaming và structured message
`MockChatAdapter` SHALL implement `ChatAdapter`, phản hồi theo `ConversationEvent` nhận được bằng cách gọi `onTextChunk` nhiều lần (mô phỏng streaming) rồi `onMessage` cho message có cấu trúc tiếp theo (`options`/`confirmation`/`form`/`result`), kết thúc bằng `onDone`.

#### Scenario: Streaming text chunk theo thứ tự
- **WHEN** `MockChatAdapter.send` được gọi với event `send_text`
- **THEN** `onMessageStart` MUST được gọi trước, sau đó `onTextChunk` MUST được gọi ít nhất 2 lần với delta tăng dần, cuối cùng `onDone` MUST được gọi

### Requirement: HttpChatAdapter streaming cross-platform qua NDJSON
`HttpChatAdapter` SHALL implement `ChatAdapter`, đọc response dạng NDJSON-over-HTTP (mỗi dòng là 1 JSON event `chunk | message | error | done | card_state`) và dispatch vào đúng `ChatStreamHandlers`. Event có `type` không nằm trong danh sách trên MUST bị bỏ qua, không lỗi. Trên web, `HttpChatAdapter` MUST dùng `fetch` + `response.body.getReader()`. Trên native (iOS/Android), `HttpChatAdapter` MUST dùng `XMLHttpRequest` với đọc incremental trong `onprogress` (diff độ dài `responseText`), MUST NOT phụ thuộc vào `fetch` đọc `ReadableStream` trên native.

#### Scenario: Parse NDJSON chunk event
- **WHEN** server trả về 1 dòng NDJSON `{"type":"chunk","messageId":"m1","delta":"Đang"}`
- **THEN** `handlers.onTextChunk('m1', 'Đang')` MUST được gọi

#### Scenario: Native đọc streaming qua XHR progressive-read
- **WHEN** `HttpChatAdapter.send` chạy trên native (Platform.OS !== 'web')
- **THEN** implementation MUST dùng `XMLHttpRequest`/`onprogress`, MUST NOT gọi `fetch(...).body.getReader()` làm đường đọc chính

#### Scenario: Lỗi mạng gọi onError
- **WHEN** request tới `HttpChatAdapter` thất bại (network error hoặc status lỗi)
- **THEN** `handlers.onError(messageId, { message })` MUST được gọi với message mô tả lỗi, `onDone` vẫn MUST được gọi sau đó để kết thúc lifecycle

### Requirement: HttpChatAdapter MAY khai báo phiên bản contract và ngôn ngữ qua header
`HttpChatAdapterOptions` SHALL có hai option tùy chọn: `contractVersion?: number` và `getLocale?: () => string | undefined`. Khi `contractVersion` có giá trị, `send()` MUST gắn header `X-Chat-Contract` bằng giá trị đó. Khi `getLocale()` trả chuỗi không rỗng, `send()` MUST gắn header `X-Locale`. `getLocale` MUST được gọi **mỗi lần** `send()` (không cache) để ngôn ngữ app đổi trong lúc chạy có hiệu lực ở lượt sau. Header của hai option này MUST đứng sau `options.headers` để giá trị khai báo ở đây thắng. Không truyền hai option thì request MUST giống hệt trước (không có hai header trên).

#### Scenario: Product bật contract v2 và gửi ngôn ngữ
- **WHEN** `createHttpChatAdapter({ url, contractVersion: 2, getLocale: () => 'vi' })` gọi `send()`
- **THEN** request MUST có `X-Chat-Contract: 2` và `X-Locale: vi`

#### Scenario: Ngôn ngữ đổi giữa hai lượt
- **WHEN** `getLocale` trả `'vi'` ở lượt 1 rồi `'en'` ở lượt 2
- **THEN** lượt 2 MUST gửi `X-Locale: en`

#### Scenario: Không truyền option
- **WHEN** adapter được tạo chỉ với `url` và `headers`
- **THEN** request MUST KHÔNG có `X-Chat-Contract` hay `X-Locale`

### Requirement: Event `card_state` MUST đến handler `onCardState` và MUST NOT đổi message đang theo dõi
Adapter SHALL parse event `{ type: 'card_state', messageId, state }` với `state` là `expired`, `cancelled` hoặc `superseded` và gọi `handlers.onCardState(messageId, state)`. `state` ngoài ba giá trị đó MUST bị bỏ qua. Adapter MUST NOT dùng `messageId` của event này làm message đang theo dõi cho nhánh lỗi mạng (nó nói về thẻ cũ, không phải tin của lượt hiện tại).

#### Scenario: Thẻ hết hạn
- **WHEN** server trả `{"type":"card_state","messageId":"gone-card","state":"expired"}`
- **THEN** `handlers.onCardState('gone-card', 'expired')` MUST được gọi

#### Scenario: State lạ
- **WHEN** server trả `card_state` với `state: 'frozen'`
- **THEN** MUST NOT gọi `onCardState` và MUST NOT lỗi

#### Scenario: Lỗi mạng sau card_state
- **WHEN** stream có `card_state` cho thẻ cũ rồi kết nối đứt trước khi có tin của lượt này
- **THEN** `onError` MUST gắn vào tin của lượt này (hoặc tin tạo mới), MUST NOT gắn vào thẻ cũ

### Requirement: Adapter MUST khớp bộ fixture contract của gateway
Repo SHALL giữ một bản sao thư mục `contract/` của gateway (kèm `README.md` ghi commit nguồn) và một test parse mọi file `.ndjson` trong đó qua `consumeNdjsonBuffer`. Test MUST kiểm: mỗi stream có đúng một `done` và `message` đứng trước mọi `chunk` cùng id; stream trong `v1/` MUST NOT gọi `onCardState`; stream trong `v2/` có `card_state` MUST gọi `onCardState` đúng `messageId` và `state`, trước `done`.

#### Scenario: Gateway đổi hình dạng event
- **WHEN** fixture trong `contract/` được cập nhật theo gateway và có hình dạng adapter không hiểu
- **THEN** test parse fixture MUST thất bại

