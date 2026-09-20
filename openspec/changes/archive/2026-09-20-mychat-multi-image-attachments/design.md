## Context

`MyChatComposer` (`src/components/ui/chat/my-chat-composer.tsx`) hiện chọn ảnh qua `pickImage`/`pickImageFromCamera` (`src/components/ui/image-picker/utils.ts`, backed bởi `expo-image-picker`, đã giới hạn `mediaTypes: ['images']`) và gửi thẳng `onSendImage(picked.uri)` ngay khi chọn xong — không có staging. `ImageMessage` (`src/components/ui/chat/types.ts`) chỉ mang 1 `imageUri`. Không consumer production nào phụ thuộc API cũ ngoài `playground/chat.tsx` (demo `MockChatAdapter`), nên đổi API là an toàn trong phạm vi kit.

## Goals / Non-Goals

**Goals:**
- Chọn nhiều ảnh (tối đa 5) từ thư viện trong 1 lần mở picker; camera vẫn thêm từng ảnh một.
- Staging: preview dải thumbnail trong composer, xoá từng ảnh, thêm ảnh, gõ text song song — tất cả trước khi Send.
- Send gộp text + ảnh thành 1 `ImageMessage` (dùng field `caption` có sẵn cho text).
- Resize giữ tỉ lệ, cạnh dài nhất 900px, bỏ qua nếu ảnh gốc đã ≤900px, áp dụng cho cả ảnh staged (preview) lẫn ảnh trong bubble đã gửi (cùng 1 URI đã resize, không resize 2 lần).
- Giữ nguyên các invariant composer đã có (auto-grow, keyboard model, isMobile vs isMobileSize) — không đụng tới.

**Non-Goals:**
- Không làm crop/edit ảnh, không caption riêng từng ảnh, không xem full-screen từ dải preview (đã chốt với user — scope tối thiểu: xem trước + xoá + thêm).
- Không làm upload thật lên server (kit vẫn ở giai đoạn local URI, giống hiện tại — `buildImageFormData` đã tồn tại sẵn cho khi cần).
- Không đổi `ChatAdapter`/`ChatStreamHandlers` interface.
- Không thêm video/tài liệu khác — vẫn chỉ ảnh (`mediaTypes: ['images']` giữ nguyên).

## Decisions

### 1. Data model: mảng `imageUris` trên `ImageMessage`, không tạo `attachments` chung
`ImageMessage.imageUri: string` → `ImageMessage.imageUris: string[]` (tối thiểu 1 phần tử). Giữ `caption?: string` làm nơi chứa text user gõ kèm ảnh — không thêm field `text` mới, tránh 2 field cùng ý nghĩa. Cân nhắc thêm `kind: 'attachment'` tách biệt nhưng bị loại vì tạo thêm 1 kind chỉ để đổi số nhiều của 1 field, không có lợi ích type-safety thêm so với đổi trực tiếp `imageUri` → `imageUris`.

### 2. `ConversationEvent`: đổi tên `send_image` → `send_images`, không giữ cả hai
Đổi hẳn (không giữ `send_image` cũ song song) vì đây là kit nội bộ, chưa release, chỉ 1 consumer (`playground/chat.tsx`) sẽ được cập nhật trong cùng change. Giữ cả 2 case sẽ buộc `MockChatAdapter`/`HttpChatAdapter` xử lý 2 nhánh tương đương nhau mãi mãi — vi phạm "không giữ shim tương thích ngược khi có thể sửa thẳng code" của repo.

### 3. Staging state sống trong `MyChatComposer`, không đẩy lên `useConversation`
`pendingImages: PickedImage[]` là state cục bộ của composer (giống cách `text` input hiện đã là state cục bộ, không phải 1 phần của `ChatMessage[]`). `useConversation`/`conversation-reducer` chỉ biết đến message đã "chốt gửi" — giữ đúng ranh giới hiện có giữa UI composer (draft) và Conversation Engine (history), tránh phải thêm khái niệm "draft message" vào reducer.

### 4. Multi-select dùng `selectionLimit` của `expo-image-picker`, kèm auto-trim phòng hờ
`pickImages()` mới trong `image-picker/utils.ts` gọi `launchImageLibraryAsync({ allowsMultipleSelection: true, selectionLimit, mediaTypes: ['images'] })` với `selectionLimit = 5 - pendingImages.length`. Native tự giới hạn UI chọn, nhưng một số Android build cũ bỏ qua `selectionLimit` — composer vẫn `slice(0, remaining)` kết quả trả về và gọi `Toast.show({ type: 'warning', text: 'Chỉ được chọn tối đa 5 ảnh' })` nếu bị cắt bớt, theo đúng lựa chọn "tự động cắt bớt + toast" đã chốt với user. Khi `remaining === 0`, nút "+" trong dải preview bị ẩn/disable, không mở picker.
Web: `expo-image-picker`'s web shim cũng nhận `allowsMultipleSelection`/`selectionLimit` qua `<input multiple>` — dùng chung 1 hàm `pickImages`, không tách nhánh web/native ở tầng composer (nhánh web/native đã nằm sẵn trong `utils.ts`/`launchPicker`).
Camera (`pickImageFromCamera`) giữ nguyên chữ ký cũ (1 ảnh/lần), composer nối kết quả vào `pendingImages` qua cùng 1 hàm `addPickedImages`.

### 5. Resize: `expo-image-manipulator`, hàm dùng chung `resizeImageIfNeeded`
Thêm dependency `expo-image-manipulator` (cross-platform, có shim web trong Expo SDK 57). Hàm mới `resizeImageIfNeeded(uri, { maxEdge: 900 })` trong `image-picker/utils.ts`, trả về `{ uri: string; wasResized: boolean }`:
- Đọc kích thước gốc qua `ImageManipulator.manipulateAsync(uri, [], { })` metadata (hoặc `Image.getSize` — chọn API cho kích thước không decode lại toàn bộ ảnh nếu có) để quyết định có cần resize không.
- Nếu `max(width, height) <= 900`: trả về `{ uri, wasResized: false }`, không xử lý gì thêm (không upscale, không re-encode ảnh đã nhỏ).
- Nếu lớn hơn: gọi `manipulateAsync(uri, [{ resize: { width: 900 } }], { compress: 0.8, format: SaveFormat.JPEG })` khi ảnh landscape (width ≥ height), hoặc `{ resize: { height: 900 } }` khi portrait — `expo-image-manipulator` tự giữ tỉ lệ khi chỉ truyền 1 trong 2 chiều, nên không cần tự tính chiều còn lại. Trả về `{ uri: result.uri, wasResized: true }`.
- **Không** gọi resize bên trong `pickImage`/`pickImageFromCamera`/`pickImages` — 2 hàm đơn ảnh hiện có còn được dùng bởi `ImagePickerField`/`use-form-entity-image.ts` cho avatar và ảnh sản phẩm, những nơi này KHÔNG nên bị ép resize xuống 900px chỉ vì yêu cầu riêng của chat (ảnh sản phẩm có thể cần độ phân giải cao hơn để zoom chi tiết). `resizeImageIfNeeded` là hàm **độc lập, opt-in**, export riêng từ `image-picker`; chỉ `MyChatComposer` gọi nó (ngay sau khi nhận `PickedImage` từ `pickImage`/`pickImages`/`pickImageFromCamera`, trước khi đưa vào staged state) — các consumer khác của picker không bị ảnh hưởng.
- `PickedImage` thêm field nội bộ `resizedTempUri?: boolean` (giá trị từ `wasResized`) để composer biết ảnh nào là file cache tự tạo (có thể xoá an toàn) và ảnh nào là URI gốc từ thư viện/camera (KHÔNG được xoá — có thể là asset thật của user, ví dụ `ph://` trên iOS).

### 5b. Trim trước khi resize, dọn dẹp cache khi ảnh staged bị bỏ
Để tránh tốn CPU + tạo rác cache cho những ảnh sẽ bị cắt bỏ ngay bởi giới hạn 5:
- Composer **trim kết quả picker về đúng số slot còn trống trước**, chỉ gọi `resizeImageIfNeeded` cho các ảnh thực sự được giữ lại (không resize ảnh bị cắt).
- Resize theo lô nhỏ (2-3 ảnh song song mỗi lô, không `Promise.all` toàn bộ 5 ảnh cùng lúc) để tránh peak RAM khi decode nhiều ảnh full-resolution đồng thời trên máy yếu.
- Khi user nhấn nút xoá 1 ảnh khỏi dải staged: nếu `resizedTempUri === true`, gọi `FileSystem.deleteAsync(uri, { idempotent: true })` (từ `expo-file-system`) để xoá file cache ngay; nếu ảnh đó là URI gốc (không resize vì đã đủ nhỏ) thì KHÔNG xoá gì (không phải file do mình tạo).
- Khi `MyChatComposer` unmount (user rời màn hình chat) mà còn ảnh staged chưa gửi: dọn toàn bộ file cache tự tạo còn lại trong danh sách staged, cùng cơ chế trên (`useEffect` cleanup).
- Ảnh đã gửi thành công (đã nằm trong `ImageMessage.imageUris`) KHÔNG bị dọn — vẫn cần hiển thị trong lịch sử chat trong suốt session.

### 5c. Dedup ảnh trùng theo `sourceId`, không theo `uri`
Re-pick cùng 1 ảnh (mở lại picker, chọn lại đúng ảnh đã staged) MUST bị bỏ qua, không thêm lần thứ hai. Không thể dedup theo `uri` vì `uri` đổi sau resize và trên web mỗi lần pick tạo `blob:` object URL mới (ephemeral) dù cùng file vật lý. `PickedImage` thêm field `sourceId` gán 1 lần tại `assetToPickedImage`, sống sót qua resize (`resizeImageIfNeeded` không ghi đè field này):
- Web (`asset.file` tồn tại): `` `${file.name}:${file.size}:${file.lastModified}` `` — 3 thuộc tính này đến từ file thật trên đĩa của user, ổn định giữa 2 lần pick cùng 1 file, kể cả khi blob URL khác nhau.
- Native: `asset.assetId` (ổn định theo thư viện ảnh) hoặc `asset.uri` khi `assetId` không có sẵn.

Composer so khớp ảnh mới chọn với danh sách đang staged bằng `sourceId`; trùng thì bỏ qua + toast, không coi là lỗi/exception.

### 6. Render nhiều ảnh trong 1 bubble: grid đơn giản, tái dùng `MyImage`
`MyChatImageMessage` lặp `message.imageUris` bằng 1 grid wrap (row, `gap` token, mỗi ô ~48% width khi ≥2 ảnh, full width khi 1 ảnh) — không dùng `ImageSlider`/carousel vì đây là bubble tin nhắn tĩnh, không cần vuốt ngang; `ImagePreview` vẫn có thể dùng sau này cho fullscreen khi tap (không nằm trong scope hiện tại nhưng kiến trúc không chặn thêm sau).

### 5d. Hiện thumbnail gốc ngay lập tức, resize chạy nền rồi swap tại chỗ
Bản đầu `addPickedImages` `await` xong toàn bộ resize rồi mới add vào `pendingImages` — user thấy delay trước khi thumbnail xuất hiện (phát hiện qua test thật). Sửa: composer state đổi từ `PickedImage[]` sang `StagedImage[]` (`{ image, isResizing }`). Ảnh được add vào `pendingImages` **ngay lập tức** với `image` là bản gốc (chưa resize) và `isResizing: true` — `MyImage` tự có skeleton trong lúc decode ảnh gốc nên không cần tự dựng skeleton riêng. Resize chạy nền (`resizeInBatches` nhận callback `onOneResized`, gọi ngay khi từng ảnh xong thay vì đợi cả batch), swap `image` sang bản đã resize + `isResizing: false` tại đúng vị trí trong mảng (key React là `sourceId`, không đổi khi `uri` đổi, nên không remount).

`canSend` thêm điều kiện `!isResizingAny` — chặn gửi ảnh gốc chưa resize (đảm bảo `imageUris` gửi lên message luôn là bản đã resize, không phá mục tiêu giảm kích thước ảnh). Khoảng chờ này rất ngắn (một vài trăm ms), không đáng kể so với việc user còn phải gõ caption/xem lại ảnh trước khi bấm gửi.

**Race ảnh bị xoá khi đang resize dở:** nếu user xoá 1 ảnh khỏi preview trước khi resize xong, promise resize đó vẫn tiếp tục chạy nền (không cancel được) — nếu không xử lý sẽ sinh ra 1 file cache resize không ai biết để dọn (leak). Composer track `removedWhileResizingRef: Set<id>`; khi resize xong mà id nằm trong set này, xoá luôn file resize vừa tạo (`deletePickedImageIfTemp`) thay vì thêm lại vào `pendingImages`.

### 6b. Photo card trung tính thay vì bọc màu brand — feedback thiết kế từ user
User gửi feedback kèm screenshot: bubble ảnh (nền `fill/active/primary` teal đặc, bọc quanh cả grid ảnh lẫn caption) nhìn nặng/dated, đặc biệt khi có ảnh nền sáng/trắng lọt vào (VD ảnh đồng hồ nền trắng) bị chỏi hẳn ra so với nền teal xung quanh.

Quyết định: theo đúng convention của các app chat phổ biến (WhatsApp/Telegram/iMessage) — **ảnh không bao giờ bọc trong màu "đã gửi"**, chỉ hiển thị trên card trung tính của riêng nó (bo góc + shadow mềm, không tint màu). Tín hiệu "tin nhắn đã gửi" (màu brand + đuôi bubble bất đối xứng) chuyển hẳn xuống 1 **pill caption riêng** bên dưới ảnh khi có text kèm theo — tái dùng nguyên `styles.userBubble`/`userBubbleText` đã có sẵn cho text message (không tạo style trùng lặp, giữ nhất quán hình dạng "đã gửi" giữa text message thường và caption ảnh).

Photo card dùng `MySurface radius="large"` — đúng pattern `interactiveCard`/`unknownCard` đã dùng trong cùng file (nền `fill/background/primary`, shadow mềm mặc định của `MySurface`, không cần khai báo `elevation` riêng). `overflow: 'hidden'` trong style truyền vào `MySurface` được component tự chuyển xuống lớp nội dung bên trong để clip ảnh theo đúng góc bo — không cần tự set `borderRadius` trên từng ảnh trong grid nữa (khác bản trước đó dùng `imageGridCell.borderRadius` riêng).

### 6c. Grid nhiều ảnh: dàn hàng ngang tự nhiên thay vì ép cố định 2 cột
Feedback tiếp theo từ user: ảnh nên dàn hàng ngang, chỉ xuống hàng khi vượt bề rộng cho phép — không ép cứng 2 cột như bản đầu (`photoGridCell` tính bằng `(PHOTO_CARD_SIZE - gap)/2`, luôn đúng 2 cột bất kể số lượng ảnh).

Đổi sang: mỗi ảnh 1 kích thước **cố định** (`PHOTO_THUMB_SIZE = 100`), container `photoGrid` chỉ có `flexDirection:'row', flexWrap:'wrap'` — không set `width` cố định, để nó tự nhiên "hug" theo tổng bề rộng các ảnh cho tới khi chạm `maxWidth` của `photoCard` (cha), lúc đó `flexWrap` mới đẩy ảnh dư xuống hàng tiếp theo. Đây chính là hành vi flexbox tiêu chuẩn cho "dàn hàng ngang, wrap khi vượt bề rộng" — không cần logic đo đếm thủ công.

Thử 2 giá trị cho `maxWidth` của `photoCard` khi có nhiều ảnh:
- Lần đầu: `MIN_BUBBLE_WIDTH` (đúng theo câu chữ ban đầu của user) — nhưng cap này khá hẹp (50-70% cột), ảnh chỉ dàn được ~2 tấm/hàng trên nhiều kích thước màn hình.
- User xem lại, yêu cầu đổi sang **`MAX_BUBBLE_WIDTH`** (100% cột, giống `photoCard` mặc định cho ảnh đơn) — cho phép nhiều ảnh/hàng hơn trên màn rộng, chỉ xuống hàng khi thật sự vượt hết bề rộng bubble. Đã bỏ hẳn style `photoCardMultiWidth` (không cần phân biệt single/multi nữa) — `photoCard` dùng chung 1 `maxWidth: MAX_BUBBLE_WIDTH` cho mọi trường hợp, code đơn giản hơn bản có điều kiện.

**Trade-off đã biết, chưa cần xử lý thêm trừ khi user yêu cầu:** khi số ảnh không chia hết cho số ảnh vừa 1 hàng (VD 5 ảnh, hàng đầu vừa 4), hàng cuối chỉ có 1 ảnh nhưng card vẫn rộng bằng hàng đầu (do bề rộng container = hàng rộng nhất trong toàn bộ grid, theo đúng cơ chế flexWrap tiêu chuẩn) — để lại khoảng trống nền card ở hàng cuối. Đây là giới hạn tự nhiên của cách tiếp cận flexWrap đơn giản (không phải bug), các app lớn xử lý bằng layout riêng theo từng số lượng ảnh (1/2/3/4+) phức tạp hơn nhiều — ngoài phạm vi yêu cầu hiện tại.

### 6d. Trên mobile khoảng trống vẫn còn to — do MySurface không "hug content", đổi sang width tuyệt đối
User test trên mobile thật, báo khoảng trống bên phải vẫn còn to (không chỉ 1 ô như mong đợi). Root cause: `MySurface` (bọc `photoCard`) **fill hết bề ngang được cấp phát** thay vì tự co theo nội dung ("hug content") — nên dù `photoGrid` không set `width` cố định (shrink-wrap theo lý thuyết), `photoCard` phía ngoài vẫn tự stretch ra hết `maxWidth: MAX_BUBBLE_WIDTH` của nó. Trên mobile, cột chat hẹp hơn desktop nhưng `MAX_BUBBLE_WIDTH` (100%) vẫn cho phép bubble rộng gần hết màn hình — nên card bị kéo rộng ra nhiều hơn nội dung ảnh thực tế, để lại khoảng trống lớn.

Fix triệt để theo đúng yêu cầu user ("canh width = 3x image rồi xuống dòng"): bỏ hẳn cách tiếp cận dựa vào `maxWidth`/shrink-wrap, chuyển sang **width tuyệt đối cố định bằng pixel**, độc lập hoàn toàn với bề rộng màn hình:
- `PHOTO_GRID_COLUMNS = 3` — số ảnh cố định mỗi hàng.
- `photoGrid.width = PHOTO_GRID_COLUMNS * PHOTO_THUMB_SIZE + (PHOTO_GRID_COLUMNS - 1) * gap` (con số cụ thể, không phải %) — luôn đúng 3 cột dù màn hình rộng hay hẹp.
- `photoCard` thêm `alignSelf: 'flex-end'` — `MySurface` route `alignSelf` lên container ngoài (xem `CONTAINER_STYLE_KEYS` trong `src/components/elements/my-surface/type.ts`), buộc bản thân card (không chỉ riêng grid ảnh bên trong) tự co theo đúng nội dung thay vì stretch theo `userImageColumn`.

Sau fix này, hàng cuối không đủ ảnh chỉ dư đúng phần ô còn thiếu (VD 5 ảnh/3 cột dư đúng 1 ô ở hàng 2) — mức dư tối thiểu, tự nhiên của mọi grid N-cột cố định, không phải bug cần xử lý thêm.

### 6e. Số ảnh ít hơn PHOTO_GRID_COLUMNS vẫn phải co đúng theo số ảnh
Fix 6d dùng width cố định `PHOTO_GRID_COLUMNS * PHOTO_THUMB_SIZE + gap` — đúng cho TH ≥3 ảnh, nhưng với đúng 2 ảnh thì card vẫn giữ nguyên width dành cho 3 cột, dư nguyên 1 ô (y hệt vấn đề ban đầu, chỉ nhỏ hơn). User phát hiện qua test thật.

Fix: `getPhotoGridWidth(imageCount)` — width tính theo `min(imageCount, PHOTO_GRID_COLUMNS)` cột thay vì luôn cố định đúng `PHOTO_GRID_COLUMNS`. Vì việc này phụ thuộc `message.imageUris.length` (giá trị runtime theo từng message, không phải giá trị tĩnh theo theme), hàm này KHÔNG nằm trong `generateStyles()` (chạy 1 lần theo theme) mà export riêng, nhận `imageCount` làm tham số, và dùng hằng số `Spacing.x1` import trực tiếp từ `@/theme/spacing` thay vì `theme.getSpacing('x1')` (giá trị spacing không đổi theo light/dark theme, nên import thẳng an toàn, không cần theme context). Component gọi hàm này per-message, truyền `width` qua style array cùng với `styles.photoGrid` tĩnh.

Kết quả: 1 cột → sizing như trước (dùng path `photoSingle`, không qua hàm này); 2 ảnh → card co đúng khít 2 cột; 3 ảnh → khít 3 cột; ≥4 ảnh → hàng đầu luôn đủ `min(count,3)=3` cột, hàng cuối dư tối thiểu theo đúng thiết kế ở mục 6d (không đổi).

### 7. Badge xoá ảnh: nằm hẳn trong viền thumbnail, không lồi ra ngoài
Bản đầu đặt badge xoá lồi ra góc thumbnail (`top: -6, right: -6`, kiểu "notification badge"), nhưng dải preview là `ScrollView` nên phần lồi ra bị clip ở mép trên/phải khi cuộn — phát hiện qua test thật của user. Sửa: đặt badge nằm trọn bên trong viền thumbnail (`top/right` dương, không âm) — loại bỏ hoàn toàn rủi ro bị `ScrollView` clip, không phụ thuộc việc canh padding cho đủ. Đồng thời đổi màu nền badge từ `fill/active/primary` (brand color, dễ lẫn với thumbnail nhiều màu) sang nền đen bán trong suốt cố định (`rgba(17,17,17,0.55)`, đánh dấu `theme-exempt` vì đây là photo-chrome cố định 2 theme, không phải semantic surface color) + icon trắng (`icon/contrast/dark`, đã đúng token từ đầu) — giống style badge xoá ảnh phổ biến trong các app ảnh/chat khác.

### 8. (Đã revert) Web tự viết file picker + native permission-settle — sai hướng
Thử 2 giả thuyết (web: double-fire `change` trong `expo-image-picker`'s web shim; native: race điều kiện cấp quyền lần đầu) và code kèm theo — **cả 2 đều sai hướng**, không phải root cause thật, và phần native còn gây regression mới (native hoàn toàn không chọn được ảnh). Đã **revert toàn bộ mục 8** (`openWebFilePicker`, `webFileToPickedImage`, `getImageDimensions`, `ensureMediaLibraryPermission`/`ensureCameraPermission`) — `pickImage`/`pickImageFromCamera`/`pickImages` quay lại dùng thẳng `expo-image-picker` (kể cả web) với `launchPicker`/`requestMediaLibraryPermissionsAsync`/`requestCameraPermissionsAsync` y hệt bản gốc trước khi có bất kỳ thay đổi nào ở mục 8.

### 9. Root cause thật: 1 ảnh không hỗ trợ trong batch làm rớt cả batch — do user tự tìm ra
User tự test và phát hiện chính xác: khi chọn nhiều ảnh mà trong đó có 1 ảnh không được hỗ trợ (định dạng lạ/quá lớn), **toàn bộ batch không hiện preview** — xảy ra như nhau trên cả web lẫn native, vì đây là 1 đoạn code dùng chung (`image-picker/utils.ts`), không phải vấn đề riêng platform nào.

Nguyên nhân: `pickImages()` (bản trước fix) build kết quả bằng `result.assets.map((asset) => assetToPickedImage(asset, maxBytes))` — `assetToPickedImage` gọi `assertValidImage` ném `ImagePickError` (`invalid_type`/`too_large`) cho asset không hợp lệ. Vì nằm trong `.map()`, **1 asset ném lỗi làm cả `.map()` throw**, khiến `pickImages()` reject toàn bộ — không phải chỉ mất 1 ảnh mà mất sạch cả batch. `runPick` trong composer bọc try/catch nuốt lỗi im lặng ("no destination surface... silently ignore"), nên user không thấy bất kỳ thông báo nào, chỉ thấy preview trống trơn.

Fix: `assetsToPickedImages()` — loop qua từng asset, `try/catch` riêng lẻ, asset lỗi thì đếm vào `skippedCount` và bỏ qua (không throw ra ngoài), asset hợp lệ thì giữ lại. `pickImages()` đổi return type từ `Promise<PickedImage[]>` sang `Promise<PickImagesResult>` (`{ images, skippedCount }`) để composer biết mà báo toast khi có ảnh bị bỏ qua (`attachmentUnsupportedSkipped`), thay vì im lặng như trường hợp trùng ảnh/vượt giới hạn 5 (đã có toast từ trước) — giữ nguyên logic báo lỗi khi TOÀN BỘ batch trống (`result.canceled || !result.assets || result.assets.length === 0` → vẫn throw `cancelled`, vì đó là user thực sự bấm Cancel/back, khác với "chọn được nhưng vài cái không hợp lệ").

Thêm 3 unit test cho `pickImages()` khoá chặt hành vi này: skip 1 asset lỗi giữa 2 asset hợp lệ, trả rỗng (không throw) khi tất cả đều lỗi, vẫn throw `cancelled` khi user thực sự huỷ.

**Ghi chú về giới hạn browser automation gặp trong lúc điều tra (không phải bug của app):** `expo-image-picker`'s web shim mở dialog bằng `input.dispatchEvent(new MouseEvent('click'))` (event giả lập) thay vì `input.click()`. Với click thật của user, việc này hoạt động bình thường (đã xác nhận multi-select trên web work khi user tự test). Nhưng khi lấy CDP simulate 1 click để test tự động, dialog thật không mở được và input tự resolve `{canceled: true}` gần như ngay sau đó (thấy rõ qua `console.log` debug tạm thời: `pickImages()` throw `ImagePickError: cancelled` dù đã set `.files` bằng tay) — khiến hầu hết các lần thử tái hiện qua browser automation trong phiên làm việc này không đáng tin cậy (có lúc "may" kịp set file trước khi resolve, có lúc không). Đây là lý do phần lớn nỗ lực verify qua browser automation ở các mục 8/9 cho ra kết quả không nhất quán — không phải dấu hiệu của bug thật trong code. Bài học: với tính năng phụ thuộc file picker/dialog thật của OS, nên ưu tiên unit test ở tầng logic (`pickImages`, `assetsToPickedImages`, v.v.) và nhờ user verify trực tiếp, thay vì cố tái hiện qua browser automation.

## Risks / Trade-offs

- **[Risk]** `expo-image-manipulator` (và `expo-file-system` cho việc xoá cache) thêm native module mới → cần rebuild dev client (EAS/Xcode/Android Studio), không chỉ reload JS. → **Mitigation**: chạy `npx expo install expo-image-manipulator expo-file-system` (đúng version theo SDK 57) và note trong `tasks.md` bước rebuild dev client trước khi test trên device thật.
- **[Risk]** Đổi `imageUri` → `imageUris` là breaking cho bất kỳ code ngoài kit nào đã bắt đầu dùng `ImageMessage`/`sendImage`. → **Mitigation**: đã audit, chỉ có `playground/chat.tsx` — cập nhật trong cùng change, không cần giai đoạn deprecation.
- **[Risk]** Resize nhiều ảnh cùng lúc (tối đa 5) decode full-resolution ở native thread có thể gây peak RAM/delay ngắn trước khi preview hiện ra, nhất là máy yếu. → **Mitigation**: trim về đúng số ảnh cần giữ trước khi resize (không resize ảnh sẽ bị cắt bỏ), resize theo lô nhỏ 2-3 ảnh song song thay vì `Promise.all` cả 5 cùng lúc (xem Decision 5b).
- **[Risk]** File ảnh đã resize (ghi vào cache directory) không tự bị xoá nếu user chọn rồi xoá khỏi preview hoặc rời màn hình chat mà không gửi → phình cache app theo thời gian. → **Mitigation**: xoá chủ động file cache tự tạo (đánh dấu qua `resizedTempUri`) khi user xoá ảnh khỏi staged hoặc khi composer unmount còn ảnh staged chưa gửi (xem Decision 5b); KHÔNG bao giờ xoá URI gốc từ thư viện ảnh của user.

## Migration Plan

Không có dữ liệu tồn tại cần migrate (`useConversation` state chỉ in-memory theo session — theo `mychat-conversation-engine` spec, remount là mất history). Triển khai theo `tasks.md`, xong task nào tick task đó; không cần feature flag vì kit chưa có consumer production.

## Open Questions

- Không còn open question — các điểm mơ hồ (giới hạn 5 ảnh khi vượt, scope preview, gộp text+ảnh, nguồn ảnh, kích thước resize, giữ tỉ lệ) đã được xác nhận trực tiếp với user trước khi viết design này.
