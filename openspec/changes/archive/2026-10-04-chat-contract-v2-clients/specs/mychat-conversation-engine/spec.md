## MODIFIED Requirements

### Requirement: Interaction resolve là vĩnh viễn trong lịch sử
Khi user resolve một interactive message (`select_option`/`confirm`/`submit_form`), Conversation Engine SHALL cập nhật field resolve tương ứng (`selectedOptionId` / `resolution` / `submittedValues`) và set `status: 'complete'`. Sau khi resolve, message đó MUST NOT còn ở trạng thái có thể tương tác lại (không render lại button active). Khóa do server báo qua `card_state` (`lockState`) là thông tin riêng, MUST NOT ghi đè hay xóa `selectedOptionId` / `resolution`.

#### Scenario: Chọn option xong không thể chọn lại
- **WHEN** user đã chọn "Kho chính" trong một `OptionsMessage`
- **THEN** `selectedOptionId` MUST được set và các option khác MUST NOT còn nhận tương tác chọn nữa (UI hiển thị "✓ Kho chính")

#### Scenario: Confirm xong giữ lại trong history
- **WHEN** user nhấn "Tạo" trên một `ConfirmationMessage`
- **THEN** `resolution` MUST là `'confirmed'` và message đó MUST tiếp tục xuất hiện trong `chat.messages` ở trạng thái đã resolve, không bị xoá khỏi lịch sử

## ADDED Requirements

### Requirement: `options` và `confirmation` MAY bị server khóa bằng `lockState`
`OptionsMessage` và `ConfirmationMessage` SHALL có thêm `lockState?: 'expired' | 'cancelled' | 'superseded'` và `changedFields?: string[]`. Reducer SHALL có action `set_card_lock { messageId, state }` đặt `lockState` cho message có `kind` là `options` hoặc `confirmation`, kể cả khi message đã có `resolution`/`selectedOptionId` (user có thể vừa bấm vào một thẻ mà server đã coi là chết). Action MUST bỏ qua `messageId` không có trong state và các `kind` khác, MUST NOT đổi `status`, MUST NOT lỗi. `useConversation` MUST nối `handlers.onCardState` vào action này.

#### Scenario: Bấm vào thẻ hết hạn
- **WHEN** user bấm Xác nhận trên thẻ mà server đã xóa, `useConversation` đặt `resolution: 'confirmed'` rồi server trả `card_state` `expired` cho thẻ đó
- **THEN** message MUST có `lockState: 'expired'` và vẫn giữ `resolution: 'confirmed'`

#### Scenario: card_state cho tin không tồn tại
- **WHEN** nhận `card_state` với `messageId` không có trong `messages` (vd phiên mới, lịch sử đã mất)
- **THEN** state MUST không đổi và MUST NOT lỗi

#### Scenario: card_state cho tin không phải thẻ
- **WHEN** nhận `card_state` cho một `TextMessage`
- **THEN** state MUST không đổi
