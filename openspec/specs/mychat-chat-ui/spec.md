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
`MyChatComposer` SHALL cung cấp input text (`MyChatComposerInput`) + nút gửi, và nút `+` mở picker ảnh dùng `pickImage`/`pickImages`/`pickImageFromCamera` đã có sẵn trong `components/ui/image-picker` (native: bottom sheet Take Photo/Choose from Library; web: file picker, hỗ trợ multi-select). `MyChatComposer` MUST NOT tự cài đặt lại logic chọn ảnh. Khi `isMobile`: hàng action riêng (attach / expand-collapse / send). Khi không `isMobile` (web, hoặc native rộng): attach + input + send trên một hàng, MUST NOT hiện nút expand.

Chọn ảnh qua picker (thư viện hoặc camera) MUST NOT gửi message ngay lập tức — ảnh MUST được đưa vào trạng thái chờ gửi (staging) trong composer, chỉ tạo `ImageMessage` thật khi user nhấn nút gửi (xem "Composer staging ảnh trước khi gửi").

#### Scenario: Gửi text (không có ảnh staged)
- **WHEN** user nhập text, không có ảnh nào đang staged, và nhấn nút gửi (hoặc submit trên bàn phím)
- **THEN** `chat.send(text)` MUST được gọi và input MUST được clear

#### Scenario: Chọn ảnh không gửi ngay
- **WHEN** user nhấn `+`, chọn ảnh qua picker (thư viện hoặc camera)
- **THEN** ảnh MUST được thêm vào danh sách staged của composer, `chat.sendImages` MUST NOT được gọi tại thời điểm này

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

### Requirement: Composer staging ảnh trước khi gửi, tối đa 5 ảnh
`MyChatComposer` SHALL hiển thị dải thumbnail xem trước (staged) ngay phía trên ô nhập text khi có ít nhất 1 ảnh đã chọn. Mỗi thumbnail MUST có nút xoá riêng để loại ảnh đó khỏi danh sách staged. Dải preview MUST có 1 ô "thêm ảnh" ở cuối để mở lại picker, ẩn/disable ô này khi đã đủ 5 ảnh staged. Tổng số ảnh staged SHALL không vượt quá 5; nếu một lượt chọn từ picker khiến tổng vượt 5, hệ thống MUST tự động chỉ giữ lại đủ số ảnh cho đến khi đạt 5 (cắt bớt phần dư) và MUST hiển thị toast cảnh báo (dùng `Toast.show` từ `components/ui/toast`) báo giới hạn 5 ảnh. Ảnh trùng với một ảnh đã có trong danh sách staged (cùng định danh asset — thư viện ảnh gốc, hoặc cùng tên/kích thước/thời gian sửa đổi trên web) MUST bị bỏ qua thay vì thêm lần thứ hai, kèm toast thông báo riêng (ưu tiên toast giới hạn 5 ảnh nếu cả hai điều kiện cùng xảy ra). User MUST vẫn gõ được text trong lúc có ảnh staged.

Nhấn nút gửi khi có ảnh staged SHALL gọi `chat.sendImages(imageUris, caption)` với `imageUris` là toàn bộ ảnh staged theo đúng thứ tự đã thêm và `caption` là nội dung text hiện tại trong ô nhập (có thể rỗng/undefined). Sau khi gửi, composer MUST xoá sạch danh sách staged và clear input text, giống hành vi clear của gửi text thường.

#### Scenario: Thêm ảnh vào danh sách staged
- **WHEN** composer chưa có ảnh staged và user chọn 2 ảnh từ thư viện
- **THEN** dải preview MUST hiển thị đúng 2 thumbnail, ô "thêm ảnh" MUST vẫn hiển thị (chưa đủ 5)

#### Scenario: Xoá 1 ảnh khỏi staged
- **WHEN** composer đang có 3 ảnh staged và user nhấn nút xoá trên ảnh thứ 2
- **THEN** dải preview MUST còn đúng 2 ảnh (ảnh thứ 1 và thứ 3 cũ), thứ tự các ảnh còn lại MUST không đổi

#### Scenario: Chọn vượt quá 5 ảnh bị cắt bớt kèm cảnh báo
- **WHEN** composer đang có 3 ảnh staged và user chọn thêm 4 ảnh từ thư viện trong 1 lượt
- **THEN** danh sách staged MUST chỉ còn đúng 5 ảnh (3 ảnh cũ + 2 ảnh đầu trong lượt chọn mới), toast cảnh báo giới hạn 5 ảnh MUST được hiển thị

#### Scenario: Chọn lại ảnh đã staged bị bỏ qua kèm cảnh báo
- **WHEN** composer đang có 1 ảnh staged (từ thư viện, có định danh asset ổn định) và user mở lại picker rồi chọn đúng ảnh đó lần nữa
- **THEN** ảnh KHÔNG được thêm lần thứ hai vào danh sách staged (danh sách vẫn giữ đúng 1 ảnh), toast thông báo "ảnh đã được chọn" MUST được hiển thị

#### Scenario: Ảnh không hỗ trợ trong batch bị bỏ qua, không làm mất ảnh hợp lệ khác
- **WHEN** user chọn 3 ảnh trong 1 lượt từ thư viện, trong đó có đúng 1 ảnh không được hỗ trợ (định dạng lạ hoặc quá lớn)
- **THEN** 2 ảnh hợp lệ MUST vẫn được thêm vào danh sách staged, toast thông báo số ảnh bị bỏ qua MUST được hiển thị — KHÔNG được làm mất cả 3 ảnh

#### Scenario: Đủ 5 ảnh thì ẩn ô thêm ảnh
- **WHEN** composer đang có đúng 5 ảnh staged
- **THEN** ô "thêm ảnh" cuối dải preview MUST bị ẩn hoặc vô hiệu hoá, nhấn `+` MUST NOT mở picker nữa

#### Scenario: Gửi ảnh staged kèm text
- **WHEN** composer có 3 ảnh staged và text "check giúp mình", user nhấn nút gửi
- **THEN** `chat.sendImages(['uri1','uri2','uri3'], 'check giúp mình')` MUST được gọi, dải preview MUST bị xoá sạch và input text MUST được clear

#### Scenario: Gửi ảnh staged không kèm text
- **WHEN** composer có 1 ảnh staged, ô nhập text đang rỗng, user nhấn nút gửi
- **THEN** `chat.sendImages(['uri1'], undefined)` MUST được gọi (không tạo `TextMessage` rỗng riêng)

### Requirement: Ảnh được resize giữ tỉ lệ trước khi gửi; preview hiển thị ngay không chờ resize
Mọi ảnh đưa vào `ImageMessage` khi gửi SHALL được resize giữ nguyên tỉ lệ khung hình, giới hạn cạnh dài nhất ở 900px. Nếu ảnh gốc đã có cạnh dài nhất ≤ 900px, hệ thống MUST NOT resize/re-encode lại (dùng thẳng URI gốc). Việc resize MUST xảy ra 1 lần tại thời điểm chọn ảnh (pick), MUST NOT resize lại lần thứ hai khi ảnh đã staged được gửi đi.

Thumbnail trong dải preview MUST hiển thị ngay lập tức bằng ảnh gốc (chưa resize) ngay khi chọn xong, MUST NOT đợi resize hoàn tất mới hiển thị — resize chạy ngầm rồi thay thế ảnh hiển thị tại chỗ (không đổi vị trí/thứ tự trong dải) khi xong. Trong lúc còn ít nhất 1 ảnh staged chưa resize xong, nút gửi MUST bị disable (đảm bảo ảnh thực sự gửi đi luôn là bản đã resize).

#### Scenario: Ảnh lớn được resize giữ tỉ lệ trước khi gửi
- **WHEN** user chọn 1 ảnh gốc kích thước 3024x4032 (portrait) rồi bấm gửi (sau khi resize xong)
- **THEN** `imageUris` gửi lên `chat.sendImages` MUST có ảnh với cạnh dài nhất (height) = 900px, chiều còn lại (width) MUST được tính theo đúng tỉ lệ gốc (≈675px), không bị méo/stretch

#### Scenario: Ảnh nhỏ giữ nguyên, không resize
- **WHEN** user chọn 1 ảnh gốc kích thước 500x400
- **THEN** ảnh đưa vào staged và gửi đi MUST giữ nguyên URI/kích thước gốc, MUST NOT bị resize hay nén lại

#### Scenario: Preview hiện ngay, không chờ resize
- **WHEN** user vừa chọn xong 1 ảnh gốc nặng (cần resize)
- **THEN** thumbnail của ảnh đó MUST xuất hiện trong dải preview ngay lập tức bằng ảnh gốc, MUST NOT hiển thị trống/chờ cho tới khi resize xong

#### Scenario: Nút gửi bị khoá trong lúc còn ảnh đang resize
- **WHEN** composer có ít nhất 1 ảnh staged mà resize chưa hoàn tất
- **THEN** nút gửi MUST ở trạng thái disable, nhấn vào MUST NOT gọi `chat.sendImages`
- **WHEN** toàn bộ ảnh staged đã resize xong
- **THEN** nút gửi MUST trở lại trạng thái bấm được (nếu có ít nhất 1 ảnh hoặc có text)

### Requirement: MyChatImageMessage render nhiều ảnh trong 1 bubble, ảnh trên card trung tính
`MyChatImageMessage` SHALL render toàn bộ `message.imageUris` trong cùng 1 photo card (1 ảnh: full width; từ 2 ảnh trở lên: mỗi ảnh 1 thumbnail kích thước cố định, xếp tối đa `PHOTO_GRID_COLUMNS` (3) ảnh mỗi hàng rồi xuống hàng tiếp theo), dùng `MyImage` cho từng ảnh và tuân theo token spacing/radius hiện có của kit (MUST NOT hardcode màu/spacing). Bề rộng vùng chứa lưới ảnh MUST là giá trị pixel cố định tính theo `min(số ảnh, PHOTO_GRID_COLUMNS)` thumbnail cộng khoảng cách giữa chúng (không phải luôn cố định đúng `PHOTO_GRID_COLUMNS` bất kể số ảnh ít hơn) — MUST NOT dựa vào `maxWidth`/co giãn theo bề rộng cột chat, vì khi đó card có thể bị kéo giãn rộng hơn nội dung thực tế (để lại khoảng trống lớn bên phải, đặc biệt trên màn hình hẹp/mobile). Photo card MUST dùng nền trung tính (không phải màu brand `fill/active/primary`) — ảnh MUST NOT bị bọc trong màu brand đặc, tránh xung đột màu với nội dung ảnh (đặc biệt ảnh nền sáng/trắng). Khi message có `caption`, MUST hiển thị caption đó bất kể `role` (`user` hoặc `assistant`) — role `user` MUST NOT bỏ qua caption; với role `user`, caption SHALL hiển thị trong 1 pill riêng theo đúng style bubble "đã gửi" hiện có (màu brand + đuôi bất đối xứng), tách biệt khỏi photo card.

#### Scenario: Bubble với 1 ảnh
- **WHEN** render `ImageMessage` có `imageUris.length === 1`
- **THEN** card MUST hiển thị đúng 1 ảnh full-width trên nền trung tính

#### Scenario: Số ảnh ít hơn PHOTO_GRID_COLUMNS thì card co đúng theo số ảnh đó
- **WHEN** render `ImageMessage` có số ảnh nhiều hơn 1 nhưng ít hơn `PHOTO_GRID_COLUMNS` (ví dụ đúng 2 ảnh)
- **THEN** bề rộng card MUST vừa khít đúng số ảnh đó (ví dụ 2 ảnh), MUST NOT giữ nguyên bề rộng dành cho `PHOTO_GRID_COLUMNS` cột rồi để dư khoảng trống

#### Scenario: Nhiều ảnh xếp đúng số cột cố định mỗi hàng, không phụ thuộc bề rộng màn hình
- **WHEN** render `ImageMessage` có nhiều hơn `PHOTO_GRID_COLUMNS` ảnh, trên bất kỳ bề rộng màn hình nào (kể cả mobile hẹp)
- **THEN** mỗi hàng MUST hiển thị đúng `PHOTO_GRID_COLUMNS` ảnh liên tiếp, ảnh dư MUST xuống hàng tiếp theo; bề rộng lưới ảnh MUST giữ nguyên (không co giãn theo bề rộng cột chat)

#### Scenario: Hàng cuối không đủ ảnh chỉ dư đúng phần thiếu
- **WHEN** render `ImageMessage` có số ảnh không chia hết cho `PHOTO_GRID_COLUMNS` (ví dụ 5 ảnh, 3 cột)
- **THEN** hàng cuối MUST chỉ dư đúng phần diện tích tương ứng với số ô còn thiếu (ví dụ 5 ảnh/3 cột dư đúng 1 ô ở hàng 2), MUST NOT dư khoảng trống lớn hơn (như khi card bị co giãn theo bề rộng cột chat)

#### Scenario: Bubble của user hiển thị caption kèm ảnh
- **WHEN** render `ImageMessage` có `role: 'user'` và `caption` không rỗng (ví dụ user gửi ảnh kèm text)
- **THEN** UI MUST hiển thị caption trong 1 pill riêng ngay dưới photo card, MUST NOT chỉ hiển thị ảnh và bỏ qua caption

#### Scenario: Ảnh không bị tô màu brand
- **WHEN** render `ImageMessage` bất kỳ (user hoặc assistant)
- **THEN** photo card chứa ảnh MUST dùng nền trung tính (token `fill/background/primary` hoặc tương đương), MUST NOT dùng `fill/active/primary` (màu brand) làm nền bọc quanh ảnh

