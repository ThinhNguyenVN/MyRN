## ADDED Requirements

### Requirement: MyChat compose list + composer + empty state
Project SHALL cung cấp `MyChat` (`src/components/ui/chat`) nhận `adapter: ChatAdapter`, `onAction: (action: MessageAction) => void`, `renderCustomMessage?: (message: CustomMessage) => ReactElement | null`, và render `MyChatList` + `MyChatComposer`, chuyển sang `MyChatEmptyState` khi chưa có message nào. `MyChat` MUST được dùng 100% component `My*`/token theme hiện có (`MyView`, `MyText`, `MySurface`, `MyButton`, `MyTextInput`...), MUST NOT hardcode màu/spacing ngoài theme token.

#### Scenario: Empty state khi chưa có message
- **WHEN** `MyChat` mount với `messages` rỗng
- **THEN** `MyChatEmptyState` MUST hiển thị (có thể kèm suggestion chips do app truyền vào), không hiển thị `MyChatList` rỗng

### Requirement: MyChatList render từ đáy, auto-scroll, streaming-safe
`MyChatList` (build trực tiếp trên `FlashList` v2, không phải wrapper của `MyList`; dùng `maintainVisibleContentPosition: { startRenderingFromBottom: true, autoscrollToBottomThreshold }` — FlashList v2 không còn prop `inverted`) SHALL render message mới nhất ở dưới cùng, tự động scroll xuống khi có message mới trong khi user đang ở đáy danh sách, và cập nhật nội dung message đang streaming tại chỗ mà không remount item.

#### Scenario: Auto-scroll khi có message mới
- **WHEN** một `ChatMessage` mới được thêm vào cuối danh sách và user đang ở đáy list
- **THEN** `MyChatList` MUST tự động scroll xuống để hiển thị message mới

#### Scenario: Streaming không giật vị trí
- **WHEN** assistant message đang ở `status: 'streaming'` và text được nối thêm nhiều lần liên tiếp
- **THEN** item tương ứng trong `MyChatList` MUST cập nhật nội dung tại chỗ (không unmount/remount), không gây nhảy vị trí scroll của các item phía trên

### Requirement: Render built-in theo từng ChatMessage.kind
`MyChatBubble` SHALL dispatch render theo `message.kind` cho toàn bộ built-in kinds: `text`, `image`, `options`, `confirmation`, `form`, `result`. Mỗi renderer built-in MUST tuân thủ interaction lifecycle của `mychat-conversation-engine` (pending → resolved hiển thị khác pending).

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

### Requirement: MessageAction render và điều hướng qua onAction
`MyChatActionRow` SHALL render danh sách `MessageAction[]` thành button/link. Với `type: 'external_link'`, `MyChat` MUST tự mở URL bằng `expo-web-browser` mà không cần app xử lý. Với `type: 'navigate'` và `type: 'custom'`, `MyChat` MUST luôn gọi `onAction(action)` do app truyền vào, MUST NOT tự thực hiện điều hướng cho 2 loại này.

#### Scenario: Nhấn external_link tự mở browser
- **WHEN** user nhấn một `MessageAction` có `type: 'external_link'`
- **THEN** `expo-web-browser` MUST được gọi để mở `url`, `onAction` MUST NOT được gọi cho action này

#### Scenario: Nhấn navigate/custom forward cho app
- **WHEN** user nhấn một `MessageAction` có `type: 'navigate'` hoặc `type: 'custom'`
- **THEN** `onAction(action)` MUST được gọi với đúng action, `MyChat` MUST NOT tự thực hiện bất kỳ điều hướng nào

### Requirement: renderCustomMessage chỉ áp dụng cho kind 'custom'
`MyChat` SHALL chỉ gọi `renderCustomMessage` cho message có `kind: 'custom'`. Các kind built-in (`text/image/options/confirmation/form/result`) MUST luôn render qua renderer built-in của kit, không thể bị override qua `renderCustomMessage`. Khi `kind === 'custom'` mà không có `renderCustomMessage` hoặc renderer trả về không xử lý được `customType`, `MyChat` MUST fallback sang `MyChatUnknownMessage` thay vì crash.

#### Scenario: Custom message dùng renderer app cung cấp
- **WHEN** một message có `kind: 'custom'` và app truyền `renderCustomMessage`
- **THEN** `MyChat` MUST render kết quả của `renderCustomMessage(message)`

#### Scenario: Thiếu renderCustomMessage không crash
- **WHEN** một message có `kind: 'custom'` nhưng `MyChat` không nhận prop `renderCustomMessage`
- **THEN** `MyChat` MUST render `MyChatUnknownMessage` fallback, MUST NOT throw lỗi runtime

### Requirement: Composer hỗ trợ text và attachment ảnh thật
`MyChatComposer` SHALL cung cấp input text (dựa trên `MyTextInput`) + nút gửi, và nút `+` mở picker ảnh dùng `pickImage`/`pickImageFromCamera` đã có sẵn trong `components/ui/image-picker` (native: bottom sheet Take Photo/Choose from Library; web: file picker). `MyChatComposer` MUST NOT tự cài đặt lại logic chọn ảnh.

#### Scenario: Gửi text
- **WHEN** user nhập text và nhấn nút gửi (hoặc submit trên bàn phím)
- **THEN** `chat.send(text)` MUST được gọi và input MUST được clear

#### Scenario: Chọn ảnh tạo ImageMessage
- **WHEN** user nhấn `+`, chọn 1 ảnh qua picker có sẵn
- **THEN** `chat.sendImage(imageUri)` MUST được gọi, tạo một `ImageMessage` role `user` trong `chat.messages`

### Requirement: Composer tự lớn/nhỏ theo số dòng text (auto-grow)
`MyChatComposer` SHALL hiển thị input 1 dòng theo mặc định và tự tăng chiều cao khi user gõ nhiều dòng, tới một `maxComposerHeight` (tương đương ~5–6 dòng) thì input MUST tự scroll nội dung bên trong thay vì tiếp tục phình cao. Logic auto-grow này MUST nằm trong `MyChatComposer` (`components/ui/chat`), MUST NOT thêm prop auto-grow generic vào `MyTextInput` dùng chung toàn app.

#### Scenario: Input lớn dần theo số dòng
- **WHEN** user gõ text xuống dòng thứ 2, thứ 3 (chưa vượt `maxComposerHeight`)
- **THEN** chiều cao input MUST tăng tương ứng để hiển thị đủ số dòng, không cắt chữ

#### Scenario: Vượt max height thì scroll nội tại
- **WHEN** nội dung input vượt `maxComposerHeight`
- **THEN** chiều cao input MUST dừng lại ở `maxComposerHeight`, phần nội dung dư MUST cuộn được bên trong input, MUST NOT tiếp tục đẩy `MyChatComposer` cao hơn

#### Scenario: Xoá hết text thì thu nhỏ lại
- **WHEN** user xoá hết nội dung nhiều dòng đã gõ
- **THEN** chiều cao input MUST thu về lại đúng chiều cao 1 dòng ban đầu

### Requirement: Composer không bị che bởi bàn phím
Chat screen (`MyChatList` + `MyChatComposer`) SHALL được bọc bởi `KeyboardAvoidingView` (bản của `react-native-keyboard-controller`, resize-based, `behavior="padding"`) để khi bàn phím mở, `MyChatComposer` MUST luôn hiển thị ngay phía trên bàn phím và `MyChatList` MUST co lại theo layout, không bị bàn phím che nội dung cuối danh sách.

#### Scenario: Mở bàn phím không che composer
- **WHEN** user tap vào input để mở bàn phím
- **THEN** `MyChatComposer` MUST hiển thị đầy đủ ngay phía trên bàn phím, message cuối cùng trong `MyChatList` MUST vẫn nhìn thấy được (không bị composer hoặc bàn phím che mất)
