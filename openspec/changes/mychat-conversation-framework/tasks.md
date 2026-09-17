## 1. Setup

- [x] 1.1 Tạo branch `feat/mychat-conversation-framework` từ `main`
- [x] 1.2 Tạo folder `src/components/ui/chat/` (barrel `index.ts` chỉ re-export, theo pattern `carousel`/`confirmation`/`my-list`)
- [x] 1.3 Đọc lại `.docs/coding-conventions.md` + `.docs/shared-ui-catalog.md` trước khi code

## 2. Data model — `mychat-conversation-engine`

- [x] 2.1 `types.ts`: `ChatMessageBase`, `TextMessage`, `ImageMessage`, `OptionsMessage`, `ConfirmationMessage`, `FormMessage`, `ResultMessage`, `CustomMessage`, union `ChatMessage`
- [x] 2.2 `types.ts`: `ConversationEvent` union (`send_text`, `send_image`, `select_option`, `confirm`, `submit_form`, `retry`)
- [x] 2.3 `types.ts`: `MessageAction` union (`navigate`, `external_link`, `custom`)
- [x] 2.4 `generate-message-id.ts`: id generator không cần dependency mới

## 3. Conversation Engine

- [x] 3.1 `conversation-reducer.ts`: pure reducer xử lý optimistic append (`send_text`/`send_image`), resolve interaction (`select_option`/`confirm`/`submit_form` → set field resolve + `status: 'complete'` vĩnh viễn), streaming update (`append_chunk`, `set_message`, `set_error`, `set_done`)
- [x] 3.2 Unit test `conversation-reducer.ts`: optimistic append, resolve interaction đúng field, streaming append không tạo message mới, error/retry state
- [x] 3.3 `use-conversation.ts`: hook public API (`messages`, `isSending`, `send`, `sendImage`, `selectOption`, `confirm`, `submitForm`, `retry`) — build `ConversationEvent` → dispatch optimistic → gọi `adapter.send(request, handlers)` → handlers dispatch tiếp vào reducer
- [x] 3.4 Xác nhận `use-conversation.ts` không import Expo Router/React Navigation, không tham chiếu domain Product/Order

## 4. ChatAdapter — interface + Mock

- [x] 4.1 `chat-adapter.ts`: interface `ChatAdapter`, `ChatRequest`, `ChatStreamHandlers`
- [x] 4.2 `mock-chat-adapter.ts`: script hoá theo `event.type` — streaming text chunk (interval) rồi `onMessage` cho message có cấu trúc kế tiếp; hỗ trợ kịch bản "Tạo sản phẩm" đủ 4 bước (options → form → confirmation → result)
- [x] 4.3 Unit test `mock-chat-adapter.ts`: thứ tự gọi handlers đúng (`onMessageStart` → nhiều `onTextChunk` → `onDone`), kịch bản đủ 4 bước sinh đúng message kind theo thứ tự

## 5. ChatAdapter — Http streaming

- [x] 5.1 `http-chat-adapter.ts`: parser NDJSON dùng chung cho cả 2 platform (1 dòng → `{type, ...}` → dispatch handler tương ứng)
- [x] 5.2 `http-chat-adapter.ts` (web): `fetch` + `response.body.getReader()`, decode UTF-8 stream, tách dòng hoàn chỉnh
- [x] 5.3 `http-chat-adapter.ts` (native): `XMLHttpRequest` `responseType: 'text'`, đọc incremental trong `onprogress` (diff `responseText`), tách dòng hoàn chỉnh
- [x] 5.4 Xử lý lỗi mạng/status lỗi → `handlers.onError` rồi `handlers.onDone`
- [x] 5.5 Unit test parser NDJSON (pure logic, không cần mount thật XHR/fetch)
- [x] 5.6 Unit test streaming end-to-end qua MSW mock streaming endpoint (ít nhất path web `fetch`)

## 6. Chat UI — list & bubble shell

- [x] 6.1 `my-chat-list.tsx`: `FlashList` v2 với `maintainVisibleContentPosition: { startRenderingFromBottom, autoscrollToBottomThreshold }` (không dùng `inverted` — prop này không còn trong FlashList v2), không remount item khi content streaming update
- [x] 6.2 `my-chat-bubble.tsx`: dispatch render theo `message.kind`
- [x] 6.3 `my-chat-typing.tsx`: hiển thị khi `status: 'pending'` và text rỗng
- [x] 6.4 `my-chat-empty-state.tsx`: dùng `MyEmptyState`/pattern tương tự, hỗ trợ suggestion chips do app truyền vào
- [x] 6.5 `styles.ts`: `generateStyles(theme)` cho toàn bộ sub-component, không style inline

## 7. Chat UI — per-kind renderer

- [x] 7.1 `my-chat-text-message.tsx`: user bubble + assistant clean text; trạng thái `error` hiển thị message lỗi + nút retry (gọi `chat.retry`)
- [x] 7.2 `my-chat-image-message.tsx`: hiển thị ảnh đã gửi (local URI)
- [x] 7.3 `my-chat-options-message.tsx`: pending hiển thị button list; resolved hiển thị "✓ <label>", các option khác mất khả năng nhấn
- [x] 7.4 `my-chat-confirmation-message.tsx`: summary fields + 2 nút; resolved hiển thị trạng thái đã xác nhận/huỷ, hỗ trợ `destructive` (styling seam cho Phase 6, không có logic thật)
- [x] 7.5 `my-chat-form-message.tsx`: simple field types `text | number | select`; submit xong chuyển read-only hiển thị `submittedValues`
- [x] 7.6 `my-chat-result-message.tsx`: title + summary + `MyChatActionRow`
- [x] 7.7 Lifecycle resolve của Options/Confirmation/Form (chọn xong không nhấn lại được) test ở tầng `conversation-reducer.test.ts` — không viết render test riêng từng component (theo mức test tối thiểu của kit)

## 8. Chat UI — composer & attachment

- [x] 8.1 `my-chat-composer.tsx`: `MyTextInput` (`multiline`) + nút gửi → gọi `chat.send`, clear input sau khi gửi
- [x] 8.2 Nút `+` gọi `pickImage`/`pickImageFromCamera` (đã có trong `components/ui/image-picker`) → `chat.sendImage(imageUri)`, không tự cài lại logic picker
- [x] 8.3 Auto-grow: theo dõi `onContentSizeChange`, animate height (Reanimated) từ 1 dòng tới `maxComposerHeight` (~5–6 dòng), quá `maxComposerHeight` thì `scrollEnabled` nội bộ input — logic nằm trong `my-chat-composer.tsx`, không sửa `MyTextInput` (Decision 8a)
- [x] 8.4 Nút gửi: hình tròn luôn hiển thị (không ẩn/mờ), đổi fill/icon color giữa trạng thái disabled (rỗng) và active (có text) theo `text.length > 0` — đối chiếu screenshot Gemini thật, không thêm mic/voice
- [x] 8.5 Bọc chat screen bằng `KeyboardAvoidingView` (`react-native-keyboard-controller`, `behavior="padding"`) trong `my-chat.tsx`, không dùng `KeyboardStickyView` cho Phase 1–4 (Decision 8b)
- [x] 8.6 `my-chat.tsx`: compose `MyChatList` + `MyChatComposer` + `MyChatEmptyState`, nhận `adapter`, `onAction`, `renderCustomMessage?`

## 9. Chat UI — actions & custom renderer

- [x] 9.1 `my-chat-action-row.tsx`: render `MessageAction[]` bằng `MyButton`
- [x] 9.2 `external_link` → tự mở qua `expo-web-browser`, không gọi `onAction`
- [x] 9.3 `navigate`/`custom` → luôn gọi `onAction(action)`, không tự xử lý
- [x] 9.4 `renderCustomMessage` chỉ áp dụng `kind: 'custom'`; fallback `my-chat-unknown-message.tsx` khi thiếu renderer hoặc thiếu xử lý cho `customType`
- [x] 9.5 Unit test: bấm `external_link` không gọi `onAction`; bấm `navigate`/`custom` gọi đúng `onAction` với đúng payload

## 10. Playground demo

- [x] 10.1 Route `src/app/(public)/(tabs)/playground/chat.tsx` (thin) re-export demo screen
- [x] 10.2 Demo screen: `<MyChat adapter={mockChatAdapter} onAction={...} renderCustomMessage={...} />`, script hoá kịch bản "Tạo sản phẩm" đủ: streaming text → Options → Form → Confirmation → processing beat → Result + action
- [x] 10.3 Thêm nhánh demo action `external_link` (mở link thật) và `navigate` (push sang 1 route có sẵn, ví dụ todo list) để smoke `onAction`
- [x] 10.4 Thêm entry link + i18n cho route `chat` vào `PLAYGROUND_LINKS`/`en.json`/`vi.json` theo đúng pattern hiện có

## 11. Docs & catalog

- [x] 11.1 Cập nhật `.docs/shared-ui-catalog.md`: thêm entry `MyChat` + sub-component vào decision table và import cheat sheet
- [x] 11.2 Ghi chú trong catalog: khi nào dùng `MyChatList` (chat, inverted) vs `MyList` (pull-to-refresh)

## 12. Testing & quality gate

- [ ] 12.1 Smoke playground: chạy hết kịch bản "Tạo sản phẩm" trên iOS Simulator/web, xác nhận không giật scroll khi streaming
- [ ] 12.2 Smoke playground: `external_link` mở browser thật; `navigate` điều hướng đúng route
- [ ] 12.3 Smoke playground: gửi ảnh qua `+` (native + web)
- [ ] 12.4 Verify trên iOS Simulator thật (không chỉ code review): auto-grow composer lớn/nhỏ đúng theo dòng, `KeyboardAvoidingView` không che composer/message cuối khi mở bàn phím, hoạt động đúng cùng `statusBarTranslucent navigationBarTranslucent` đã set ở root layout (Decision 8)
- [x] 12.5 `yarn lint` + `npx dotenv -e .env.test -- yarn test` pass
- [x] 12.6 Review diff: không implement trong `index.ts`; không `!= null`; không inline JSX handler; styles trong `styles.ts`; không dependency mới trong `package.json`
- [ ] 12.7 Sync OpenSpec → archive sau khi merge PR
