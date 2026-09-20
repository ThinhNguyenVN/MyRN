## Why

MyRN hiện chưa có bất kỳ chat/conversational UI nào. Định hướng dài hạn của sản phẩm là biến chat thành một **AI command center**: user dùng natural language để thực hiện business workflow (tạo sản phẩm, xem đơn hàng, kiểm tra tồn kho...) thông qua Gemini + MCP, thay vì chỉ hỏi đáp text. Nếu build thẳng UI chat gắn với 1 provider/backend cụ thể ngay từ đầu, kiến trúc sẽ khó mở rộng sang AI Gateway + MCP thật (Phase 5–6) mà không phải redesign lại UI. Change này ship **foundation Phase 1–4**: Chat UI kit, Conversation Engine, và ChatAdapter (mock + http) — hoàn toàn provider-agnostic — để playground chứng minh được toàn bộ workflow (streaming → options → form → confirmation → structured result → action) bằng dữ liệu giả lập, sẵn sàng cho Phase 5–6 chỉ cần thay adapter mà không đụng UI/Engine.

## What Changes

- Thêm **shared chat kit mới** `src/components/ui/chat/` (props-driven, generic, không business logic):
  - `MyChat`, `MyChatList` (FlashList render bắt đầu từ đáy + autoscroll qua `maintainVisibleContentPosition` — FlashList v2 không còn prop `inverted` — streaming-safe; **không** mở rộng `MyList` vì `MyList` được thiết kế cho pull-to-refresh top-down list, khác hẳn hành vi chat), `MyChatBubble`, `MyChatComposer` (text input + gửi + attachment `+`; tham khảo Gemini app: auto-grow theo số dòng tới max height rồi tự scroll, nút gửi morph khi có text, screen bọc `KeyboardAvoidingView` resize-based của `react-native-keyboard-controller` đã có sẵn — không thêm voice/mic), `MyChatTyping`, `MyChatEmptyState`.
  - Renderer cho từng `ChatMessage.kind` built-in: `text`, `image`, `options`, `confirmation`, `form` (simple form), `result` — mỗi loại có lifecycle pending → resolved rõ ràng, resolved trở thành history vĩnh viễn (không quay lại trạng thái active).
  - `MyChatActionRow` render `MessageAction[]`; `external_link` có default handler (mở qua `expo-web-browser`); `navigate`/`custom` luôn forward qua `onAction` do app inject.
  - Extension point `renderCustomMessage` — chỉ áp dụng cho `kind: 'custom'`; các kind built-in luôn render qua kit để đảm bảo interaction lifecycle nhất quán giữa mọi product.
  - Attachment: wire thật với `pickImage` / `pickImageFromCamera` / `buildImageFormData` đã có sẵn trong `components/ui/image-picker` — không tự viết lại image picker.
- Thêm **Conversation Engine** (`useConversation`): quản lý `ChatMessage[]` (discriminated union theo `kind`), interaction state machine, gọi `ChatAdapter`. State **in-memory theo session only** (không persist qua app restart trong Phase 1–4 — backend Phase 5 sẽ là nguồn sự thật cho history thật).
- Thêm **ChatAdapter** (provider-agnostic, không biết Gemini/OpenAI/MCP):
  - `MockChatAdapter` — script hoá streaming + structured message cho playground.
  - `HttpChatAdapter` — generic, cross-platform streaming thật (NDJSON-over-HTTP): web dùng `fetch` + `ReadableStream`, native dùng `XMLHttpRequest` progressive-read (RN fetch không đọc `ReadableStream` đáng tin cậy trên native). Chưa có backend thật để trỏ vào — implement đầy đủ để validate kiến trúc, test qua MSW mock streaming endpoint.
- Thêm **playground demo** `playground/chat` script hoá đúng flow: text streaming → Options → Form → Confirmation → processing → Result + action CTA, cộng thêm nhánh test `external_link` và `navigate` để chứng minh extension point hoạt động thật, không chỉ lý thuyết.
- Cập nhật `.docs/shared-ui-catalog.md` với entry mới cho chat kit.

**Không** trong scope change này (Non-Goals — xem `design.md`): Gemini/OpenAI/AI SDK, MCP server/client thật, business API (Product/Order...), backend AI Gateway thật, real tool execution.

## Capabilities

### New Capabilities
- `mychat-conversation-engine`: Data model (`ChatMessage`, `ConversationEvent`, `MessageAction`) + `useConversation` hook API + interaction lifecycle (pending → resolved vĩnh viễn) + in-memory-only state.
- `mychat-chat-ui`: `MyChat` và các sub-component (list/bubble/composer/typing/empty-state), render built-in cho từng `ChatMessage.kind`, `MessageAction` rendering (incl. `external_link` default handler), `onAction` extension cho `navigate`/`custom`, `renderCustomMessage` extension scoped `kind: 'custom'`, attachment wiring qua `image-picker` có sẵn.
- `mychat-chat-adapter`: `ChatAdapter` interface + `ChatStreamHandlers` contract, `MockChatAdapter`, `HttpChatAdapter` (streaming cross-platform, generic wire format, không coupling Gemini/MCP).
- `mychat-playground-workflow`: Playground `chat` demo bắt buộc chạy được toàn bộ scripted end-to-end workflow (streaming → options → form → confirmation → result + action) bằng `MockChatAdapter`, cộng smoke cho `external_link`/`navigate` action.

### Modified Capabilities
- (none) — không đổi requirement của bất kỳ platform capability nào hiện có (`layout-surface-primitives`, `list-async-ui-states`, ...).

## Impact

- Code mới: `src/components/ui/chat/**` (types, adapter, engine hook/reducer, UI components), `src/app/(public)/(tabs)/playground/chat.tsx` (route mỏng) + feature-less demo screen tương ứng.
- Docs: `.docs/shared-ui-catalog.md` (entry mới cho chat kit).
- Dependencies: **không thêm dependency mới** — tái dùng `@shopify/flash-list`, `expo-web-browser`, `components/ui/image-picker`, `react-native-keyboard-controller` (đã có sẵn, dùng `KeyboardAvoidingView` cho composer — xem `design.md` Decision 8) đã có sẵn trong repo. Message id dùng util tự viết, không cần `uuid`/`nanoid`.
- Tests: unit test cho phần logic thuần (`conversation-reducer`, `http-chat-adapter` NDJSON parsing) + playground smoke cho từng message kind và cho toàn bộ scripted workflow.
- Không đụng `src/api` (RTK Query/axios stack hiện có) — chat transport tách biệt hoàn toàn, không đi qua `axiosBaseQuery`.
