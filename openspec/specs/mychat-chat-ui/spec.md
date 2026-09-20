# mychat-chat-ui Specification

## Purpose
Shared kit `MyChat`: list từ đáy, composer overlay, renderer theo `ChatMessage.kind`, không gắn Gemini/MCP.
## Requirements
### Requirement: MyChat compose list + composer + empty state
`MyChat` (`src/components/ui/chat`) SHALL nhận `adapter: ChatAdapter`, `onAction: (action: MessageAction) => void`, `renderCustomMessage?: (message: CustomMessage) => ReactElement | null`, và render `MyChatList` + `MyChatComposer`, chuyển sang `MyChatEmptyState` khi chưa có message nào. `MyChat` MUST dùng component `My*`/token theme hiện có (`MyView`, `MyText`, `MySurface`, `MyButton`, …). Input composer MUST dùng `MyChatComposerInput` (kit `TextInput`), MUST NOT thêm auto-grow generic vào `MyTextInput` dùng chung. MUST NOT hardcode màu/spacing ngoài theme token.

Hai trục layout MUST tách, không trộn `if (isWeb)` cho cả hai:

- **`isMobile`** (`Platform !== web` **và** hẹp): chrome composer — 2 hàng, nút expand/collapse, grow native.
- **`isMobileSize`** (hẹp, mọi platform): bề ngang cột — gutter / `MAX_CHAT_WIDTH` (900).

Khi `isMobileSize === false`, bề ngang *nội dung* (bubble + composer) MUST căn giữa và không rộng hơn 900. Thanh cuộn list MUST sát mép cửa sổ (không kẹp scrollbar trong cột 900). Căn cột MUST bằng `paddingHorizontal` theo width cột đã đo — MUST NOT `overflow: hidden` / `maxWidth` trên wrapper đang animate theo bàn phím.

#### Scenario: Empty state khi chưa có message
- **WHEN** `MyChat` mount với `messages` rỗng
- **THEN** `MyChatEmptyState` MUST hiển thị (có thể kèm suggestion chips do app truyền vào), không hiển thị `MyChatList` rỗng

### Requirement: MyChatList render từ đáy, auto-scroll, streaming-safe
`MyChatList` (build trực tiếp trên `FlashList` v2, không phải wrapper của `MyList`; dùng `maintainVisibleContentPosition: { startRenderingFromBottom: true, autoscrollToBottomThreshold }` — FlashList v2 không còn prop `inverted`) SHALL render message mới nhất ở dưới cùng, tự động scroll xuống khi có message mới trong khi user đang ở đáy danh sách, và cập nhật nội dung message đang streaming tại chỗ mà không remount item. Khoảng cách giữa các message MUST dùng `ItemSeparatorComponent` (FlashList v2 không áp `gap` trên `contentContainerStyle` vì cell `position: absolute`).

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
`MyChatComposer` SHALL cung cấp input text (`MyChatComposerInput`) + nút gửi, và nút `+` mở picker ảnh dùng `pickImage`/`pickImageFromCamera` đã có sẵn trong `components/ui/image-picker` (native: bottom sheet Take Photo/Choose from Library; web: file picker). `MyChatComposer` MUST NOT tự cài đặt lại logic chọn ảnh. Khi `isMobile`: hàng action riêng (attach / expand-collapse / send). Khi không `isMobile` (web, hoặc native rộng): attach + input + send trên một hàng, MUST NOT hiện nút expand.

**Follow-up (không chặn merge Phase 1–4):** smoke gửi ảnh qua `+` (native + web) chưa chạy trong session archive. Wiring `sendImage` + `ImageMessage` local URI vẫn là AC hiện tại; session sau có thể bổ sung requirement (preview, upload, đa ảnh, v.v.) sau khi test thật.

#### Scenario: Gửi text
- **WHEN** user nhập text và nhấn nút gửi (hoặc submit trên bàn phím)
- **THEN** `chat.send(text)` MUST được gọi và input MUST được clear

#### Scenario: Chọn ảnh tạo ImageMessage
- **WHEN** user nhấn `+`, chọn 1 ảnh qua picker có sẵn
- **THEN** `chat.sendImage(imageUri)` MUST được gọi, tạo một `ImageMessage` role `user` trong `chat.messages`

### Requirement: Composer tự lớn/nhỏ theo số dòng text (auto-grow)
`MyChatComposer` SHALL hiển thị input 1 dòng theo mặc định và tự tăng chiều cao khi user gõ nhiều dòng, tới `composerMaxHeight` (viewport trừ header, footer composer, keyboard, gap) thì input MUST tự scroll nội dung bên trong. Khi `isMobile` MUST cho phép expand gần full viewport rồi collapse (nút + kéo xuống khi scroll input đang ở đầu); sau collapse + gửi, chiều cao MUST về đúng 1 dòng mặc định. Logic auto-grow MUST nằm trong `components/ui/chat`, MUST NOT thêm prop auto-grow generic vào `MyTextInput`.

**Mô hình height (cấm regress):** native MUST để `TextInput` tự giãn khi `scrollEnabled` false. Kit chỉ giữ **sàn** (`minHeight` / `expandedMinHeight`, `0` = không ép) và **trần** (`maxHeight` = `composerMaxHeight`). `onContentSizeChange` / `scrollHeight` MUST chỉ dùng để biết overflow (bật scroll) và để set height textarea **web**. MUST NOT ghi `height` animated từ số đo native; MUST NOT state máy `isRemeasuring` / remount input để “reset” height. Expand nâng sàn lên trần; collapse hạ sàn về `0` (rơi đúng height chữ). `onLayout` chiều cao composer đưa vào list `paddingBottom` MUST có ngưỡng (không commit từng frame lúc animate expand).

#### Scenario: Input lớn dần theo số dòng
- **WHEN** user gõ text xuống dòng thứ 2, thứ 3 (chưa vượt `composerMaxHeight`)
- **THEN** chiều cao input MUST tăng tương ứng để hiển thị đủ số dòng, không cắt chữ

#### Scenario: Vượt max height thì scroll nội tại
- **WHEN** nội dung input vượt `composerMaxHeight`
- **THEN** chiều cao input MUST dừng lại ở `composerMaxHeight`, phần nội dung dư MUST cuộn được bên trong input, MUST NOT tiếp tục đẩy `MyChatComposer` cao hơn

#### Scenario: Xoá hết text thì thu nhỏ lại
- **WHEN** user xoá hết nội dung nhiều dòng đã gõ
- **THEN** chiều cao input MUST thu về lại đúng chiều cao 1 dòng ban đầu

#### Scenario: Gửi sau expand/collapse về 1 dòng
- **WHEN** user expand composer, gõ thêm, collapse, rồi gửi
- **THEN** composer MUST trở về chiều cao 1 dòng mặc định (không giữ height lúc expand)

#### Scenario: Expand / collapse (isMobile)
- **WHEN** user tap expand
- **THEN** ô MUST lên gần trần viewport (cùng công thức `composerMaxHeight`), list MUST NOT bị đẩy vì composer overlay
- **WHEN** user tap collapse hoặc kéo xuống từ lúc input đang ở đầu nội dung
- **THEN** ô MUST thu về height chữ hiện tại, có animation; kéo giữa nội dung dài MUST chỉ cuộn chữ
- **WHEN** kéo collapse chưa đủ rồi thả
- **THEN** ô MUST nảy về height expand, không kẹt nửa chừng

#### Scenario: FlashList cách bubble bằng separator
- **WHEN** `MyChatList` render từ 2 message trở lên
- **THEN** giữa các item MUST có khoảng `ItemSeparatorComponent` theo token spacing (không dựa vào `gap` trên `contentContainerStyle`)

### Requirement: Composer không bị che bởi bàn phím; list vẫn cuộn hết
Composer overlay `position: absolute` đáy. `MyChatList` / `MyChatEmptyState` MUST `paddingBottom` theo chiều cao composer đã `onLayout` (+ token `x4`) để message cuối không bị che. Web: không nhấc theo software keyboard.

**Mô hình keyboard native (cấm regress — `translateY` cả list đã làm mất khả năng kéo tới tin đầu):**

- Composer: `translateY` theo `useReanimatedKeyboardAnimation().height` (cùng nhịp phím).
- List: **không** `translateY`. Co viewport trên UI thread (`marginBottom: -height.value`) để FlashList còn nằm trên màn — `offset 0` vẫn là tin đầu.
- MUST NOT `KeyboardAvoidingView` `behavior="padding"`.
- MUST NOT `paddingTop` / `contentOffset` list **sau khi** phím mở xong (JS thread → giật).
- MUST NOT `overflow: hidden` trên cột / `listWrapper` đang lift hoặc co theo phím.
- Nếu user đang ở đáy khi phím xong: được phép **một** `scrollToEnd({ animated: false })` trên `useGenericKeyboardHandler` `onEnd` (không dùng `useKeyboardHandler` — tránh đánh Android resize khi list mount/unmount). Không neo lại message giữa list từng frame.

#### Scenario: Mở bàn phím không che composer
- **WHEN** user tap vào input để mở bàn phím (native)
- **THEN** `MyChatComposer` MUST nằm ngay phía trên bàn phím, message cuối cùng trong `MyChatList` MUST vẫn nhìn thấy được (không bị composer hoặc bàn phím che mất)

#### Scenario: Mở phím vẫn kéo hết transcript
- **WHEN** list dài và bàn phím đang mở (native)
- **THEN** user MUST kéo được tới message đầu, nội dung MUST NOT bị cắt vì viewport list bị đẩy khỏi màn hình

#### Scenario: Đóng phím không thụt rồi nhảy
- **WHEN** user đóng bàn phím (native)
- **THEN** list MUST NOT thụt một đoạn ≈ chiều cao phím rồi mới nhảy lên; mở/đóng MUST cùng nhịp phím, không giật thêm một nhịp sau khi phím đã ổn

#### Scenario: Web mép bubble = composer, scrollbar sát cửa sổ
- **WHEN** `isMobileSize === false`
- **THEN** mép trái/phải bubble MUST thẳng hàng mép composer (`MAX_CHAT_WIDTH`); thanh cuộn list MUST sát mép cửa sổ

