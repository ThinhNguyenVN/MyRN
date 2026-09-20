# mychat-chat-adapter Specification

## Purpose
`ChatAdapter` + `MockChatAdapter` + HTTP NDJSON streaming — không coupling Gemini/MCP.
## Requirements
### Requirement: ChatAdapter là interface provider-agnostic
Hệ thống SHALL định nghĩa `ChatAdapter { send(request: ChatRequest, handlers: ChatStreamHandlers): Promise<void>; cancel?(messageId: string): void }` và `ChatStreamHandlers { onMessageStart, onTextChunk, onMessage, onError, onDone }`. Định nghĩa các type này MUST NOT tham chiếu tới bất kỳ khái niệm nào của một provider AI cụ thể (Gemini, OpenAI, tool call, MCP).

#### Scenario: Interface không rò rỉ provider
- **WHEN** review type `ChatAdapter`, `ChatRequest`, `ChatStreamHandlers`
- **THEN** không có field/type nào đặt tên hoặc tham chiếu Gemini/OpenAI/MCP/tool-call

### Requirement: MockChatAdapter script hoá streaming và structured message
`MockChatAdapter` SHALL implement `ChatAdapter`, phản hồi theo `ConversationEvent` nhận được bằng cách gọi `onTextChunk` nhiều lần (mô phỏng streaming) rồi `onMessage` cho message có cấu trúc tiếp theo (`options`/`confirmation`/`form`/`result`), kết thúc bằng `onDone`.

#### Scenario: Streaming text chunk theo thứ tự
- **WHEN** `MockChatAdapter.send` được gọi với event `send_text`
- **THEN** `onMessageStart` MUST được gọi trước, sau đó `onTextChunk` MUST được gọi ít nhất 2 lần với delta tăng dần, cuối cùng `onDone` MUST được gọi

### Requirement: HttpChatAdapter streaming cross-platform qua NDJSON
`HttpChatAdapter` SHALL implement `ChatAdapter`, đọc response dạng NDJSON-over-HTTP (mỗi dòng là 1 JSON event `chunk | message | error | done`) và dispatch vào đúng `ChatStreamHandlers`. Trên web, `HttpChatAdapter` MUST dùng `fetch` + `response.body.getReader()`. Trên native (iOS/Android), `HttpChatAdapter` MUST dùng `XMLHttpRequest` với đọc incremental trong `onprogress` (diff độ dài `responseText`), MUST NOT phụ thuộc vào `fetch` đọc `ReadableStream` trên native.

#### Scenario: Parse NDJSON chunk event
- **WHEN** server trả về 1 dòng NDJSON `{"type":"chunk","messageId":"m1","delta":"Đang"}`
- **THEN** `handlers.onTextChunk('m1', 'Đang')` MUST được gọi

#### Scenario: Native đọc streaming qua XHR progressive-read
- **WHEN** `HttpChatAdapter.send` chạy trên native (Platform.OS !== 'web')
- **THEN** implementation MUST dùng `XMLHttpRequest`/`onprogress`, MUST NOT gọi `fetch(...).body.getReader()` làm đường đọc chính

#### Scenario: Lỗi mạng gọi onError
- **WHEN** request tới `HttpChatAdapter` thất bại (network error hoặc status lỗi)
- **THEN** `handlers.onError(messageId, { message })` MUST được gọi với message mô tả lỗi, `onDone` vẫn MUST được gọi sau đó để kết thúc lifecycle

