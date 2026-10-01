## Why

Gateway `my-agent-platform` đã ship contract v2 (M7, PR #14): client khai báo `X-Chat-Contract: 2` và `X-Locale`, gateway trả thêm event `card_state` (`expired | cancelled | superseded`) và cho phép `changedFields` trên thẻ `confirmation`/`options`. MyChat hiện chỉ biết v1:

- `dispatchNdjsonEvent` **âm thầm bỏ** mọi event lạ (`default: return`), nên `card_state` bị nuốt và thẻ cũ vẫn hiện nút bấm.
- Thẻ chỉ khóa **ở client** (`resolution`, `selectedOptionId`) sau khi user bấm; thẻ hết hạn, đã hủy từ phía server hay (sau M9) bị thay thế không có trạng thái "bị khóa".
- Adapter không gửi `X-Chat-Contract` / `X-Locale`, nên gateway luôn coi là v1 và dùng ngôn ngữ mặc định của app.
- Không có test parse dùng chung fixture của gateway: nếu hai bên lệch nhau thì client mất event mà không báo lỗi.

Đây là M7b trong `my-agent-platform/docs/master-plan.md`: phần client của M7, làm ở MyRN trước, my-store kéo về bằng `sync-from-myrn` ở PR riêng.

## What Changes

- **Header contract.** `createHttpChatAdapter` nhận thêm `contractVersion?: number` và `getLocale?: () => string | undefined`. Có giá trị thì gắn `X-Chat-Contract` và `X-Locale`; `getLocale` được gọi **mỗi lần `send()`** để đổi ngôn ngữ app có hiệu lực ngay. Không truyền thì request y như v1 hôm nay.
- **Event `card_state`.** Adapter parse event này và gọi handler mới `onCardState(messageId, state)`. Event **không** cập nhật `lastKnownMessageId` (nó nói về thẻ cũ, không phải tin của lượt hiện tại).
- **Khóa thẻ từ server.** `OptionsMessage` và `ConfirmationMessage` có thêm `lockState?: 'expired' | 'cancelled' | 'superseded'`. Reducer thêm action `set_card_lock`; thẻ có `lockState` bị gỡ nút/chip và hiện nhãn trạng thái, cùng kiểu dòng đã resolve hôm nay. `lockState` được ưu tiên hiển thị hơn `resolution`/`selectedOptionId` (user bấm vào thẻ đã chết thì reducer vẫn đặt `resolution` cục bộ trước khi server trả lời).
- **Nhãn khóa lấy từ i18n của client** (`components.chat.cardExpired | cardCancelled | cardSuperseded`, `vi` và `en`). Gateway chỉ gửi mã trạng thái, không gửi câu.
- **`changedFields`.** `ConfirmationMessage` và `OptionsMessage` có thêm `changedFields?: string[]`. Dòng `summary` có nhãn nằm trong danh sách được làm nổi (chấm màu `info` + giá trị đậm màu `info`, không đổi nền để hợp cả theme sáng và tối). Gateway chỉ phát field này từ M9; M7b làm UI trước và kiểm bằng mock/test.
- **Mock adapter.** `MockChatAdapter` thêm một kịch bản phát `card_state` và thẻ có `changedFields` để xem thử trong playground.
- **Fixture contract.** Chép `contract/` từ gateway vào MyRN (ghi commit nguồn); test đọc `v1/streams/*.ndjson` và `v2/streams/*.ndjson`, chạy qua `consumeNdjsonBuffer`, kiểm đúng handler được gọi và stream v1 không đổi.
- **Spec và changelog.** Cập nhật `mychat-chat-adapter`, `mychat-chat-ui`, `mychat-conversation-engine`; thêm mục vào `CHANGELOG.md` (Unreleased) để skill `sync-from-myrn` của product nhận ra.

Không đổi: luồng chat v1, cách gửi `ConversationEvent`, `useConversation` public API (chỉ thêm xử lý nội bộ), các kind message khác (`text`, `form`, `result`, `image`, `custom`).

## Capabilities

### Modified Capabilities

- `mychat-chat-adapter`: header `X-Chat-Contract`/`X-Locale`, event `card_state`, handler `onCardState`, fixture contract.
- `mychat-chat-ui`: trạng thái khóa của `options`/`confirmation`, nhãn khóa, làm nổi `changedFields`.
- `mychat-conversation-engine`: `lockState` và `changedFields` trong `ChatMessage`, action `set_card_lock`, quan hệ giữa khóa từ server và resolve cục bộ.

## Impact

- **Code:** `src/components/ui/chat/` (`types.ts`, `chat-adapter.ts`, `http-chat-adapter.ts`, `conversation-reducer.ts`, `use-conversation.ts`, `my-chat-confirmation-message.tsx`, `my-chat-options-message.tsx`, `styles.ts`, `mock-chat-adapter.ts`), `src/i18n/resources/{vi,en}.json`, test mới/đã có, thư mục `contract/` (bản sao có ghi nguồn).
- **API công khai của kit:** `HttpChatAdapterOptions` thêm hai option tùy chọn; `ChatStreamHandlers` thêm `onCardState`. Mọi nơi tự cài `ChatStreamHandlers` phải thêm handler (trong repo này chỉ `useConversation` và test).
- **Repo khác:** my-store kéo về bằng `sync-from-myrn` ở PR riêng, bật `contractVersion: 2` và `getLocale` trong `use-chat-adapter.ts`. Gateway: cập nhật `docs/master-plan.md` khi xong.
- **Rủi ro chính:** (1) gateway chưa có bản `en`, nên `X-Locale: en` vẫn nhận câu server tiếng Việt (lùi về mặc định) trong khi nhãn khóa là tiếng Anh; (2) `changedFields` chưa có dữ liệu thật đến M9; (3) thẻ vẫn bấm được trong lúc `isSending` (ngoài phạm vi, server chặn).
