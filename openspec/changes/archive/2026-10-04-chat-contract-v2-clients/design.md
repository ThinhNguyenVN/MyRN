## Context

- Gateway contract: `my-agent-platform/contract/README.md`, `src/channels/chat/chat.types.ts`, spec `ndjson-chat-contract`. v2 = v1 + `card_state` + `changedFields` + `X-Locale`.
- MyRN hôm nay: `http-chat-adapter.ts` chỉ nhận `chunk | message | error | done`; reducer khóa thẻ bằng `resolution`/`selectedOptionId` do chính client đặt khi user bấm; thẻ resolved **gỡ nút** (không render disabled).
- Gateway đã whitelist DTO với `forbidNonWhitelisted: false`, nên field thừa trong `history` (như `lockState`) bị bỏ qua, không gây 400.
- Chốt với Thịnh (1/10): phạm vi đủ bộ; header do **adapter** đặt (`contractVersion` + `getLocale`); nhãn khóa dùng **i18n client**; locale lấy từ **ngôn ngữ app đang chọn**; `changedFields` làm **UI luôn**; thẻ bị khóa **gỡ nút + nhãn trạng thái**; MyRN trước, my-store sau.

## Goals / Non-Goals

**Goals**
- MyChat nói được v2 mà không phá v1 (không truyền option mới thì không đổi gì).
- Thẻ bị server khóa không còn nút bấm và nói rõ vì sao.
- Test chạy **cùng fixture** với gateway.

**Non-Goals**
- Không đổi vocabulary `ConversationEvent` gửi lên server.
- Không chặn tương tác thẻ trong lúc `isSending` (server đã chặn).
- Không thêm bản dịch `en` ở gateway (việc của app/gateway sau).
- Không phát `superseded`/`changedFields` thật: gateway làm ở M9.

## Decisions

### D1. Header đặt trong adapter, theo từng lần gửi

`HttpChatAdapterOptions` thêm:

```ts
contractVersion?: number
getLocale?: () => string | undefined
```

`send()` dựng header: `Content-Type`, rồi `...options.headers`, rồi `X-Chat-Contract` (nếu có `contractVersion`) và `X-Locale` (nếu `getLocale()` trả chuỗi không rỗng). `options.headers` đứng trước để product vẫn ghi đè được khi cần. Hàm `getLocale` thay vì giá trị tĩnh vì user đổi ngôn ngữ trong lúc app đang chạy, và my-store dựng adapter mới mỗi lần `send()` nên cách này khớp luôn.

**Vì sao không để product tự thêm vào `headers`:** hai nơi (my-store, bds) sẽ tự viết lại cùng một cặp tên header; tên header là một phần của contract nên thuộc kit.

### D2. `card_state` là một handler riêng, không đi qua `onMessage`

`ChatStreamHandlers.onCardState(messageId, state)`. Lý do không tái dùng `onMessage`: event không mang một `ChatMessage` mới, mà sửa một tin cũ. `dispatchNdjsonEvent` **không** gọi `onMessageIdSeen` cho event này vì `messageId` của nó là thẻ cũ; nếu nhớ nhầm làm `lastKnownMessageId`, lỗi mạng ngay sau đó sẽ gắn `error` vào thẻ cũ thay vì tin của lượt này.

`state` không nằm trong tập đã biết (client cũ hơn gateway) thì bỏ qua, không lỗi (tiếp tục triết lý "event lạ thì bỏ").

### D3. `lockState` tách khỏi `resolution`/`selectedOptionId`

`lockState` là sự thật **do server nói**; `resolution`/`selectedOptionId` là thứ **user đã bấm**. Hai trường độc lập, hiển thị theo thứ tự ưu tiên:

1. `lockState` có giá trị → gỡ nút, hiện nhãn khóa.
2. Ngược lại `resolution`/`selectedOptionId` → như hôm nay.
3. Ngược lại → nút tương tác.

Reducer `set_card_lock` luôn đặt `lockState` (kể cả thẻ đã có `resolution`), vì kịch bản thực tế là: user bấm vào thẻ cũ, `useConversation` đặt `resolution` cục bộ ngay, rồi server trả `card_state: expired`. Hiển thị "Đã xác nhận" cho một thẻ đã hết hạn là sai. Chỉ áp dụng cho `options` và `confirmation`; kind khác bỏ qua. `messageId` không có trong state thì bỏ qua.

Không đổi `status` khi khóa (thẻ vẫn `complete`).

### D4. Nhãn khóa lấy từ i18n client

Gateway chỉ gửi mã. Client tự dịch: `components.chat.cardExpired` ("Đã hết hạn" / "Expired"), `cardCancelled` ("Đã hủy" / "Cancelled" — dùng lại khóa `cancelled` hiện có), `cardSuperseded` ("Đã được thay bằng thẻ mới" / "Replaced by a newer card"). Hiện dùng cùng bố cục dòng `resolvedRow` (icon + nhãn) để khỏi thêm dạng hiển thị mới; icon `close-circle` / `icon/inactive/primary`.

### D5. Làm nổi `changedFields` bằng màu `info`, không đổi nền

Token `fill/info/*` là màu đặc ở cả hai theme, quá nặng cho một hàng. Dùng: chấm tròn nhỏ (`fill/info/primary`) cạnh nhãn dòng và giá trị `text/info/primary`. Khớp theo `label` chính xác với `summary[].label`. Dùng chung một component dòng cho `confirmation`; `options` không có `summary` nên `changedFields` trên `options` được nhận vào kiểu (contract cho phép) nhưng chưa có chỗ vẽ, ghi rõ trong spec để M9 quyết khi có dữ liệu thật.

### D6. Fixture: chép nguyên thư mục, test đọc từ đó

Chép `contract/` vào **gốc repo MyRN** để đường dẫn giống hệt gateway; `README.md` của bản copy ghi commit nguồn `my-agent-platform@8785125`. Test `http-chat-adapter.contract.test.ts` đọc từng file `.ndjson` bằng `fs`, đưa qua `consumeNdjsonBuffer` với handler ghi lại các lời gọi, rồi kiểm:

- mọi stream v1 + v2: có đúng một `done`, `message` đứng trước mọi `chunk` cùng id;
- `v1/streams/*` không bao giờ gọi `onCardState`;
- `v2/streams/{expired,cancelled}-card.ndjson` gọi `onCardState` đúng `messageId` và `state`, trước `done`.

### D7. Mock adapter

Thêm kịch bản để xem thử trong playground: gõ "hết hạn" thì `MockChatAdapter` phát một thẻ xác nhận có `changedFields`, rồi lượt sau phát `card_state` cho thẻ trước. Không đụng kịch bản "Tạo sản phẩm" hiện có.

## Risks / Trade-offs

- **Lệch ngôn ngữ nhãn và câu server.** Gateway chưa có `en`; user chọn English thấy nhãn khóa tiếng Anh, câu server tiếng Việt. Chấp nhận; thông báo qua `Content-Language` đã đúng, nội dung `en` là việc của app.
- **Chép tay `contract/`.** Dễ cũ. Giảm thiểu: `README.md` ghi commit nguồn; PR đổi fixture ở gateway phải kèm PR chép lại (quy ước đã có ở `AGENTS.md` của gateway).
- **`changedFields` chưa có dữ liệu thật.** UI chỉ kiểm bằng test và mock; có thể cần chỉnh nhỏ khi M9 phát thật.
- **Thẻ bấm được trong lúc `isSending`.** Giữ nguyên.

## Migration / Rollback

Product bật v2 bằng cách truyền `contractVersion: 2`. Bỏ option này thì mọi thứ về v1 (gateway tự bỏ `card_state`). Không có migration dữ liệu.

## Open Questions

Không còn.
