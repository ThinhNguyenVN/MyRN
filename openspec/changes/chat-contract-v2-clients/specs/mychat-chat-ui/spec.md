## MODIFIED Requirements

### Requirement: Render built-in theo từng ChatMessage.kind
`MyChatBubble` SHALL dispatch render theo `message.kind` cho toàn bộ built-in kinds: `text`, `image`, `options`, `confirmation`, `form`, `result`. Mỗi renderer built-in MUST tuân thủ interaction lifecycle của `mychat-conversation-engine` (pending → resolved hiển thị khác pending). Với `options` và `confirmation`, `lockState` (khóa do server báo) MUST được ưu tiên hơn `selectedOptionId`/`resolution` khi chọn cách hiển thị.

#### Scenario: OptionsMessage hiển thị options rồi resolved state
- **WHEN** render một `OptionsMessage` chưa `selectedOptionId`
- **THEN** tất cả option MUST hiển thị dạng button có thể nhấn
- **WHEN** `selectedOptionId` đã được set
- **THEN** UI MUST chuyển sang hiển thị "✓ <label option đã chọn>", các option khác MUST NOT còn hiển thị dạng button nhấn được

#### Scenario: ConfirmationMessage hiển thị summary + 2 nút
- **WHEN** render một `ConfirmationMessage` có `summary`
- **THEN** UI MUST hiển thị các field trong `summary` và 2 nút (`confirmLabel`/`cancelLabel` hoặc default)
- **WHEN** `resolution` đã được set
- **THEN** UI MUST hiển thị trạng thái đã xác nhận/đã huỷ tương ứng, không còn 2 nút tương tác được

#### Scenario: TextMessage lỗi có retry
- **WHEN** một `TextMessage` có `status: 'error'`
- **THEN** UI MUST hiển thị nội dung lỗi (`error.message`) kèm affordance retry gọi `chat.retry(messageId)`

## ADDED Requirements

### Requirement: Thẻ `options`/`confirmation` bị server khóa MUST gỡ nút và hiện nhãn trạng thái
Khi `lockState` có giá trị, `MyChatOptionsMessage` và `MyChatConfirmationMessage` SHALL gỡ các nút/chip tương tác và hiển thị một dòng trạng thái (icon + nhãn) cùng kiểu dòng đã resolve, thay cho trạng thái resolve cục bộ. Nhãn MUST lấy từ i18n của client: `components.chat.cardExpired` (`expired`), `components.chat.cancelled` (`cancelled`), `components.chat.cardSuperseded` (`superseded`), có bản `vi` và `en`. Nội dung thẻ (prompt, summary, danh sách option) MUST vẫn hiển thị.

#### Scenario: Thẻ xác nhận hết hạn
- **WHEN** render `ConfirmationMessage` có `lockState: 'expired'` (kể cả khi `resolution` đã được set)
- **THEN** UI MUST hiển thị nhãn "Đã hết hạn" (hoặc bản dịch `en`) và MUST NOT hiển thị nút Xác nhận/Hủy hay nhãn "Đã xác nhận"

#### Scenario: Thẻ chọn bị thay
- **WHEN** render `OptionsMessage` có `lockState: 'superseded'`
- **THEN** UI MUST hiển thị nhãn "Đã được thay bằng thẻ mới" và MUST NOT hiển thị chip option nhấn được

### Requirement: Dòng `summary` có trong `changedFields` MUST được làm nổi
`MyChatConfirmationMessage` SHALL làm nổi dòng `summary` có `label` bằng đúng một phần tử của `changedFields`: một chấm tròn nhỏ màu `fill/info/primary` cạnh nhãn và giá trị dùng màu `text/info/primary`. Thẻ không có `changedFields` hoặc `changedFields` rỗng MUST hiển thị y như trước. `changedFields` chứa nhãn không có trong `summary` MUST bị bỏ qua. Làm nổi MUST NOT đổi nền dòng. Với `OptionsMessage`, `changedFields` được nhận vào kiểu nhưng MUST NOT ảnh hưởng hiển thị (thẻ options không có `summary`).

#### Scenario: Thẻ sửa một trường
- **WHEN** render `ConfirmationMessage` có `summary` gồm "Tên" và "Giá" và `changedFields: ['Giá']`
- **THEN** dòng "Giá" MUST có chấm và giá trị màu `info`, dòng "Tên" MUST hiển thị như thường

#### Scenario: Không có changedFields
- **WHEN** render `ConfirmationMessage` không có `changedFields`
- **THEN** mọi dòng `summary` MUST hiển thị như thường
