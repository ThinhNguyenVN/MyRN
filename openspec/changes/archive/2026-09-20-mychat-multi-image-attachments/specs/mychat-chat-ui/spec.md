## MODIFIED Requirements

### Requirement: Composer hỗ trợ text và attachment ảnh thật
`MyChatComposer` SHALL cung cấp input text (`MyChatComposerInput`) + nút gửi, và nút `+` mở picker ảnh dùng `pickImage`/`pickImages`/`pickImageFromCamera` đã có sẵn trong `components/ui/image-picker` (native: bottom sheet Take Photo/Choose from Library; web: file picker, hỗ trợ multi-select). `MyChatComposer` MUST NOT tự cài đặt lại logic chọn ảnh. Khi `isMobile`: hàng action riêng (attach / expand-collapse / send). Khi không `isMobile` (web, hoặc native rộng): attach + input + send trên một hàng, MUST NOT hiện nút expand.

Chọn ảnh qua picker (thư viện hoặc camera) MUST NOT gửi message ngay lập tức — ảnh MUST được đưa vào trạng thái chờ gửi (staging) trong composer, chỉ tạo `ImageMessage` thật khi user nhấn nút gửi (xem "Composer staging ảnh trước khi gửi").

#### Scenario: Gửi text (không có ảnh staged)
- **WHEN** user nhập text, không có ảnh nào đang staged, và nhấn nút gửi (hoặc submit trên bàn phím)
- **THEN** `chat.send(text)` MUST được gọi và input MUST được clear

#### Scenario: Chọn ảnh không gửi ngay
- **WHEN** user nhấn `+`, chọn ảnh qua picker (thư viện hoặc camera)
- **THEN** ảnh MUST được thêm vào danh sách staged của composer, `chat.sendImages` MUST NOT được gọi tại thời điểm này

## ADDED Requirements

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
