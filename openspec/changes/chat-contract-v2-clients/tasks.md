## 1. Mốc trước khi đổi

- [x] 1.1 Chạy `npx dotenv -e .env.test -- yarn test` và `yarn check:types` trên `main` sạch làm mốc

## 2. Types, adapter, header

- [x] 2.1 `types.ts`: `CardLockState`; `OptionsMessage` và `ConfirmationMessage` thêm `lockState?` và `changedFields?`
- [x] 2.2 `chat-adapter.ts`: `ChatStreamHandlers.onCardState(messageId, state)`
- [x] 2.3 `http-chat-adapter.ts`: `NdjsonEvent` thêm `card_state`; `dispatchNdjsonEvent` gọi `onCardState` (không gọi `onMessageIdSeen`; `state` ngoài ba giá trị thì bỏ qua)
- [x] 2.4 `HttpChatAdapterOptions`: `contractVersion?`, `getLocale?`; `send()` dựng header `X-Chat-Contract` / `X-Locale` sau `options.headers`, gọi `getLocale` mỗi lần gửi
- [x] 2.5 Cập nhật `http-chat-adapter.test.ts`: `collectHandlers` có `onCardState`; test header (có/không option, locale đổi giữa hai lượt), test `card_state` (đúng handler, state lạ, không đổi message đang theo dõi)

## 3. Reducer và hook

- [x] 3.1 `conversation-reducer.ts`: action `set_card_lock`; chỉ cho `options`/`confirmation`; bỏ qua id lạ và kind khác; không đổi `status`, không đụng `resolution`/`selectedOptionId`
- [x] 3.2 `use-conversation.ts`: `onCardState` dispatch `set_card_lock`
- [x] 3.3 Test reducer: khóa thẻ chưa resolve, khóa thẻ đã `resolution` (giữ cả hai), id lạ, kind khác

## 4. UI và i18n

- [x] 4.1 `src/i18n/resources/vi.json` và `en.json`: `components.chat.cardExpired`, `components.chat.cardSuperseded` (dùng lại `cancelled`)
- [x] 4.2 `my-chat-confirmation-message.tsx` và `my-chat-options-message.tsx`: `lockState` ưu tiên; gỡ nút/chip, hiện dòng trạng thái (icon `close-circle`, `icon/inactive/primary`)
- [x] 4.3 `my-chat-confirmation-message.tsx`: làm nổi dòng `changedFields` (chấm `fill/info/primary`, giá trị `text/info/primary`); style trong `styles.ts`; lấy phần dòng summary ra component dùng chung với thẻ kết quả nếu cần để không lặp (`my-chat-result-message.tsx` có JSX tương tự)
- [x] 4.4 Test render: `lockState` cho từng state ở cả hai kind, `lockState` thắng `resolution`, `changedFields` làm nổi đúng dòng, không có `changedFields` thì như cũ

## 5. Mock và playground

- [x] 5.1 `mock-chat-adapter.ts`: kịch bản xem thử `card_state` + thẻ có `changedFields` (không đụng kịch bản "Tạo sản phẩm"); cập nhật test mock

## 6. Fixture contract

- [x] 6.1 Chép `contract/` từ `my-agent-platform@8785125` vào gốc repo; `contract/README.md` thêm dòng nguồn và ngày chép
- [x] 6.2 `http-chat-adapter.contract.test.ts`: đọc mọi `.ndjson`, kiểm `done` duy nhất và `message` trước `chunk`; v1 không gọi `onCardState`; v2 gọi đúng `messageId`/`state` trước `done`
- [x] 6.3 Nếu `jest` không đọc được file ngoài `src/`, chỉnh `roots`/đường dẫn tối thiểu (ghi lý do)

## 7. Spec, changelog, kiểm chứng

- [ ] 7.1 Đồng bộ delta vào `openspec/specs/{mychat-chat-adapter,mychat-chat-ui,mychat-conversation-engine}/spec.md` khi archive
- [x] 7.2 `CHANGELOG.md` mục Unreleased: Added (header v2, `card_state`, khóa thẻ, `changedFields`, fixture contract); ghi rõ product cần làm gì để bật (`contractVersion`, `getLocale`)
- [x] 7.3 `.docs/shared-ui-catalog.md`: cập nhật mục `MyChat` nếu có nhắc `HttpChatAdapterOptions`
- [x] 7.4 `yarn check:commit` (types, lint, tokens, test) qua
- [ ] 7.5 Xem thử playground: khóa thẻ hết hạn/đã hủy, thẻ có `changedFields`, theme sáng và tối, web và mobile (Thịnh kiểm bằng mắt)

## 8. Chốt

- [ ] 8.1 Mở PR MyRN; Thịnh review
- [ ] 8.2 Sau merge: PR my-store (`sync-from-myrn`, `contractVersion: 2`, `getLocale` đọc `app.locale`) và test tay 2 ca: thẻ cũ bị khóa, đổi vi→en gửi `X-Locale: en`
- [ ] 8.3 Archive change ở MyRN; cập nhật `docs/master-plan.md` của gateway (M7b xong)
