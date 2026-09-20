## 1. Dependency & image-picker: multi-select + resize

- [x] 1.1 Cài `expo-image-manipulator` + `expo-file-system` (`npx expo install expo-image-manipulator expo-file-system`), rebuild dev client nếu cần test trên device thật.
- [x] 1.2 Thêm `resizeImageIfNeeded(uri, mimeType, { maxEdge: 900 })` trong `src/components/ui/image-picker/utils.ts`: lấy kích thước gốc, bỏ qua nếu cạnh dài nhất ≤900px (trả `wasResized: false`), ngược lại resize giữ tỉ lệ (chỉ truyền 1 chiều cho `manipulateAsync`) + nén (`compress: 0.8`, JPEG) và trả `{ uri, wasResized: true }`.
- [x] 1.3 `PickedImage` (`type.ts`) thêm field `resizedTempUri?: boolean` set từ `wasResized`, để composer biết ảnh nào là file cache tự tạo có thể xoá an toàn.
- [x] 1.4 Thêm `pickImages(options)` (multi-select thư viện: `allowsMultipleSelection: true`, `selectionLimit`) trong `utils.ts`, map toàn bộ `result.assets` qua `assetToPickedImage`. `pickImage`/`pickImageFromCamera`/`pickImages` KHÔNG tự resize — giữ nguyên hành vi cho các consumer khác (`ImagePickerField`, avatar, ảnh sản phẩm); `resizeImageIfNeeded` là hàm riêng, chỉ `MyChatComposer` gọi.
- [x] 1.5 Thêm helper `deletePickedImageIfTemp(image: PickedImage)` dùng `File` (`expo-file-system`, kiểm tra `exists` trước khi `.delete()`), chỉ xoá khi `resizedTempUri === true`.
- [x] 1.6 Export `pickImages`, `resizeImageIfNeeded`, `deletePickedImageIfTemp` từ `src/components/ui/image-picker/index.ts`; cập nhật `type.ts` với `PickedImage.resizedTempUri` và `PickImagesOptions`.

## 2. Data model: ImageMessage/ConversationEvent nhiều ảnh

- [x] 2.1 `src/components/ui/chat/types.ts`: đổi `ImageMessage.imageUri: string` → `imageUris: string[]`; đổi `ConversationEvent` case `send_image` → `send_images: { imageUris: string[]; caption?: string }`.
- [x] 2.2 `src/components/ui/chat/use-conversation.ts`: đổi `userImageMessage`/`sendImage` → nhận `imageUris: string[]`, đổi tên hàm export `sendImage` → `sendImages`, cập nhật dispatch event `send_images`.
- [x] 2.3 `src/components/ui/chat/conversation-reducer.ts`: cập nhật theo shape mới nếu reducer có xử lý riêng cho `imageUri`/`send_image` (kiểm tra trước khi sửa). → Không có xử lý riêng, không cần sửa.
- [x] 2.4 `src/components/ui/chat/mock-chat-adapter.ts`: đổi case `'send_image'` → `'send_images'`, cập nhật `handleSendImage` cho phù hợp (không cần đổi hành vi mock, chỉ đổi type/tên).

## 3. Composer: staging UI (chọn nhiều, preview, xoá, thêm)

- [x] 3.1 `my-chat-composer.tsx`: thêm state `pendingImages: PickedImage[]`; đổi `runPick('library')` sang gọi `pickImages({ selectionLimit: 5 - pendingImages.length })`, `runPick('camera')` vẫn `pickImageFromCamera()` rồi append.
- [x] 3.2 Cắt bớt kết quả nếu vượt quá 5 tổng, gọi `Toast.show({ type: 'warning', text: '...' })` khi bị cắt (import từ `@/components/ui/toast`).
- [x] 3.3 Thêm component/JSX dải preview thumbnail phía trên `MyChatComposerInput`: mỗi ảnh có nút xoá (dùng `MyPressable`/`MyButton.Icon`), ô "+" cuối dải (ẩn khi đủ 5), dùng `MyImage` cho thumbnail, style qua `generateStyles`/theme token trong `styles.ts` (không hardcode màu/spacing).
- [x] 3.4 Đổi `onSendImage` prop → `onSendImages: (imageUris: string[], caption?: string) => void`; nút gửi: nếu `pendingImages.length > 0` gọi `onSendImages(uris, text || undefined)`, ngược lại giữ hành vi `onSend(text)` cũ.
- [x] 3.5 Sau khi gửi: clear `pendingImages` + clear text input (tái dùng logic clear hiện có).
- [x] 3.6 `my-chat.tsx`: đổi `handleSendImage`/`onSendImage` → `handleSendImages`/`onSendImages` gọi `chat.sendImages(imageUris, caption)`.

## 4. Hiển thị nhiều ảnh trong bubble

- [x] 4.1 `my-chat-image-message.tsx`: đổi từ render 1 `message.imageUri` sang lặp `message.imageUris`, layout grid (1 ảnh full width, ≥2 ảnh chia cột) dùng token spacing/radius có sẵn trong `styles.ts`.

## 5. Cập nhật consumer & kiểm thử

- [x] 5.1 `src/app/(public)/(tabs)/playground/chat.tsx`: cập nhật theo API mới (`sendImages`, `imageUris`) nếu đang tham chiếu API cũ. → Không tham chiếu trực tiếp API cũ, không cần sửa.
- [x] 5.2 Chạy lại các test hiện có liên quan và sửa nếu type thay đổi làm fail biên dịch. → `npx jest` toàn repo: 173 pass (1 suite fail có sẵn từ trước, không liên quan — thiếu env `API_BASE_URL`). Thêm mock `expo-file-system`/`expo-image-manipulator` cho Jest (theo pattern `expo-haptics-mock.js` có sẵn) vì 2 native module mới crash dưới Jest. `npx tsc --noEmit` và `npx eslint` sạch.
- [~] 5.3 Test thủ công trên simulator/device: chọn nhiều ảnh (thư viện, camera), vượt quá 5 ảnh (thấy toast + bị cắt), xoá ảnh khỏi preview, gửi kèm text, gửi không text, kiểm tra ảnh trong bubble đã resize (không bị vỡ layout/giật list) trên cả mobile và web.
  → Đã chạy `expo start --web` (`.env.test`) và kiểm tra `/playground/chat` qua browser automation: composer render đúng (không còn khoảng trống khi chưa có ảnh staged), gửi text-only vẫn hoạt động đúng như trước (bubble hiện, input clear, mock adapter trả lời) — xác nhận không có regression ở luồng cũ. Click nút "+" không văng lỗi console.
  → KHÔNG thể tự động hoá bước chọn ảnh thật: dialog chọn file của OS/trình duyệt cần user-gesture thật, công cụ browser automation không thấy/điều khiển được `<input type="file">` ẩn (bị loại khỏi accessibility tree) — đây là giới hạn cố hữu của việc test file picker qua automation, không phải lỗi code. Server dev vẫn đang chạy ở `http://localhost:8099/playground/chat` để bạn tự tay chọn ảnh thật (thư viện) kiểm tra: multi-select, giới hạn 5 + toast, xoá/thêm ảnh trong preview, gửi kèm/không kèm text, và ảnh trong bubble đã được resize đúng tỉ lệ. Camera + test trên iOS/Android simulator cần làm riêng trên device/simulator thật (không test được qua web).
- [x] 5.4 `openspec validate mychat-multi-image-attachments --strict` phải pass trước khi coi proposal hoàn tất. → Pass.

## 6. Fix từ feedback sau test thật

- [x] 6.1 Chặn gửi ảnh trùng: thêm `PickedImage.sourceId` (web: `name:size:lastModified` của `File` gốc — `uri` là `blob:` ephemeral nên không dùng được; native: `assetId` hoặc `uri` fallback), gán tại `assetToPickedImage`, sống sót qua `resizeImageIfNeeded`. Composer dedup theo `sourceId` khi thêm ảnh mới, bỏ qua ảnh trùng + toast `attachmentDuplicateSkipped` (ưu tiên toast giới hạn 5 ảnh nếu cả hai cùng xảy ra).
- [x] 6.2 Fix badge xoá ảnh bị cắt trong `ScrollView`: đổi từ lồi ra góc (`top:-6,right:-6`) sang nằm hẳn trong viền thumbnail (`top:3,right:3`, size 18x18) — hết clip hoàn toàn. Đổi màu nền từ `fill/active/primary` sang đen bán trong suốt cố định (`rgba(17,17,17,0.55)`, đánh dấu `theme-exempt`), giữ icon trắng (`icon/contrast/dark`).
- [x] 6.3 Xác nhận với user: multi-select trên web hoạt động đúng (cần giữ Cmd/Ctrl khi click nhiều ảnh trong dialog — hành vi chuẩn của OS/trình duyệt, không phải bug) — không cần sửa code.
- [x] 6.4 `tsc --noEmit`, `eslint`, `lint:tokens` sạch; `npx jest src/components/ui/chat src/components/ui/image-picker`: 28/28 pass sau fix.
- [x] 6.5 User re-test thủ công: chọn lại đúng 1 ảnh đã staged (thấy toast, không bị thêm trùng) + xem badge xoá ảnh trong preview (không còn bị cắt, nền đen mờ + icon trắng) → xác nhận ổn.

## 7. Hiện thumbnail ngay lập tức, resize chạy nền

- [x] 7.1 Composer state đổi `PickedImage[]` → `StagedImage[]` (`{ image, isResizing }`). `addPickedImages` add ảnh vào `pendingImages` ngay với ảnh gốc (`isResizing: true`) thay vì đợi resize xong mới add — dùng skeleton sẵn có của `MyImage` lúc decode ảnh gốc, không dựng skeleton riêng.
- [x] 7.2 `resizeInBatches` đổi sang nhận callback `onOneResized(id, resized)`, gọi ngay khi từng ảnh resize xong (không đợi cả batch) để swap `image` tại đúng vị trí trong `pendingImages` (key theo `sourceId`, không remount khi `uri` đổi).
- [x] 7.3 `canSend` thêm điều kiện không còn ảnh nào `isResizing` — chặn gửi ảnh gốc chưa resize.
- [x] 7.4 Xử lý race xoá ảnh khi đang resize dở: `removedWhileResizingRef` track id đã xoá; khi resize xong mà id nằm trong set này thì xoá luôn file resize vừa tạo thay vì thêm lại vào `pendingImages` (tránh leak cache).
- [x] 7.5 `tsc --noEmit`, `eslint --fix` (1 lỗi format prettier, đã fix), toàn bộ `jest` (173 pass, 1 suite fail có sẵn không liên quan) — sạch.
- [x] 7.6 User re-test thủ công: xác nhận ổn (feedback tiếp theo là bug "lần đầu load app chọn 5 ảnh không work", xem mục 8).

## 8. Fix bug "lần đầu chọn ảnh không vào preview, phải chọn lại lần 2"

- [x] 8.1 Tái hiện qua browser automation (web): phát hiện lỗi thật `NotFoundError: Failed to execute 'removeChild' ... not a child of this node` ném ra từ bên trong `expo-image-picker`'s web shim khi `change` bị bắn hơn 1 lần trên cùng 1 `<input type="file">` — lần chọn ảnh thật sự bị `resolve()` bỏ qua trong im lặng (Promise chỉ settle 1 lần).
- [x] 8.2 Viết `openWebFilePicker(multiple)` riêng trong `image-picker/utils.ts` (không dùng module web của `expo-image-picker` nữa cho `pickImage`/`pickImages`) — dùng `<input type="file">` tự quản lý + `.click()`, có cờ `settled` chặn resolve/removeChild chạy quá 1 lần dù `change`/`cancel` bắn bao nhiêu lần.
- [x] 8.3 Thêm `webFileToPickedImage`/`getImageDimensions` (đọc `width`/`height` qua `new Image()` để `resizeImageIfNeeded` vẫn hoạt động đúng trên web sau khi đổi sang picker tự viết); tách `baseFileToPickedImage` dùng chung với `pickedImageFromFile` (thêm luôn `sourceId` cho `pickedImageFromFile`, không đổi hành vi/consumer hiện có).
- [x] 8.4 Native: thử giả thuyết race điều kiện cấp quyền lần đầu (`ensureMediaLibraryPermission`/`ensureCameraPermission` check `get*PermissionsAsync` trước + delay 300ms) — **KHÔNG work, user test báo native hoàn toàn không chọn được ảnh nữa (nặng hơn bug gốc)**.
- [x] 8.5 Cập nhật `utils.test.ts` mock `getCameraPermissionsAsync`/`getMediaLibraryPermissionsAsync` cho khớp flow permission mới (bước 8.4).
- [x] 8.6 Verify lại qua browser automation (web, sau fix web ở 8.2-8.3): pick 5 ảnh → cả 5 vào preview đúng, không lỗi console, bấm Send → bubble hiện đủ 5 ảnh dạng lưới, composer reset — pass.
- [x] 8.7 `tsc --noEmit`, `eslint`, toàn bộ `jest` (173 pass, 1 suite fail có sẵn không liên quan) — sạch.
- [x] 8.8 User báo native bị regression sau 8.4 → **revert hẳn 8.4**: `ensureMediaLibraryPermission`/`ensureCameraPermission` quay về đúng logic gốc (chỉ `request...PermissionsAsync()`, bỏ `get...` check + delay). Dọn lại mock trong `utils.test.ts` (bỏ `getCameraPermissionsAsync`/`getMediaLibraryPermissionsAsync` không còn dùng). `tsc`/`eslint`/`jest` sạch lại sau revert.
- [x] 8.9 User tự tìm ra root cause thật (xem mục 9) → toàn bộ mục 8 (8.2, 8.3, và phần đã revert ở 8.4/8.8) được coi là hướng sai, **revert tiếp phần web** (8.2/8.3) theo yêu cầu của user.

## 9. Root cause thật: 1 ảnh không hỗ trợ làm rớt cả batch (web + native)

- [x] 9.1 Revert hoàn toàn `openWebFilePicker`, `webFileToPickedImage`, `getImageDimensions`, `baseFileToPickedImage` (mục 8.2/8.3) — `pickImage`/`pickImageFromCamera`/`pickImages` quay lại dùng thẳng `expo-image-picker` kể cả trên web, y hệt bản gốc trước mục 8. `pickedImageFromFile` cũng revert về bản standalone gốc (không có `sourceId`, không dùng chung base helper) — không cần vì dedup của MyChat đi qua `assetToPickedImage`, không qua `pickedImageFromFile`.
- [x] 9.2 Fix root cause: thêm `assetsToPickedImages()` trong `utils.ts` — loop từng asset, `try/catch` riêng lẻ quanh `assetToPickedImage`, asset lỗi (`ImagePickError`) thì đếm vào `skippedCount` và bỏ qua thay vì để `.map()` throw làm rớt cả batch.
- [x] 9.3 `pickImages()` đổi return type `Promise<PickedImage[]>` → `Promise<PickImagesResult>` (`{ images, skippedCount }`, thêm type mới trong `type.ts`, export từ `index.ts`). Giữ nguyên: `result.canceled || !result.assets || result.assets.length === 0` vẫn throw `cancelled` (user thực sự huỷ, khác với "chọn được nhưng có ảnh không hợp lệ").
- [x] 9.4 Composer (`runPick`): destructure `{ images, skippedCount }` từ `pickImages()`, hiện `Toast.show({ type: 'warning', text: t('components.chat.attachmentUnsupportedSkipped', { count: skippedCount }) })` khi `skippedCount > 0`, rồi `addPickedImages(images)` với phần ảnh hợp lệ còn lại.
- [x] 9.5 Thêm i18n key `attachmentUnsupportedSkipped` (en/vi).
- [x] 9.6 Thêm 3 unit test cho `pickImages()` trong `utils.test.ts`: skip đúng 1 asset lỗi giữa 2 asset hợp lệ (giữ lại 2, `skippedCount: 1`); trả `{images: [], skippedCount: 1}` (không throw) khi asset duy nhất lỗi; vẫn throw `cancelled` khi user huỷ thật (0 asset).
- [x] 9.7 `tsc --noEmit`, `eslint`, toàn bộ `jest` (176 pass, 1 suite fail có sẵn không liên quan) — sạch.
- [x] 9.8 Verify qua browser automation (web): xác nhận lại luồng baseline (không có ảnh lỗi) vẫn hoạt động ở mức unit test; E2E qua browser automation cho đúng kịch bản "1 ảnh lỗi giữa nhiều ảnh hợp lệ" không cho kết quả tin cậy được (nhiều nhiễu từ việc giả lập chọn file qua `DataTransfer`/dispatch sự kiện thủ công, không phản ánh đúng thao tác chọn file thật của user — xem ghi chú trong design.md mục 9). Coi 3 unit test ở 9.6 là bằng chứng chính cho fix này, không dựa vào browser automation nữa cho phần này.
- [x] 9.9 User re-test thủ công trên thiết bị thật → xác nhận ổn ("ổn rồi đó").

## 10. Fix caption không hiển thị khi gửi ảnh kèm text

- [x] 10.1 Phát hiện: `MyChatImageMessage` nhánh `isUser` return sớm `<MyView style={styles.userBubble}>{image}</MyView>` — không bao giờ render `message.caption`, kể cả khi có. Bug có sẵn từ trước (Phase 1-4, ảnh đơn không kèm text nên chưa lộ ra), chỉ lộ rõ khi multi-image + caption thực sự hoạt động.
- [x] 10.2 Fix: nhánh `isUser` render thêm `<ConditionRenderer when={Boolean(message.caption)}><MyText typography="body" style={styles.userBubbleText}>{message.caption}</MyText></ConditionRenderer>` sau `{image}`, dùng đúng style `userBubbleText` (màu trắng) đã dùng cho text message.
- [x] 10.3 Thêm `gap: getSpacing('x2')` vào `userBubble` style (không ảnh hưởng bubble chỉ có 1 con như text-only message, chỉ tạo khoảng cách khi có cả ảnh + caption).
- [x] 10.4 `tsc --noEmit`, `eslint`, toàn bộ `jest` (176 pass, 1 suite fail có sẵn không liên quan) — sạch.
- [x] 10.5 User re-test thủ công: xác nhận caption hiển thị đúng, nhưng feedback tiếp theo là màu nền/UI bubble ảnh chưa đẹp (xem mục 11).

## 11. Redesign bubble ảnh — bỏ nền teal đặc, dùng photo card trung tính

- [x] 11.1 Nhận feedback từ user (kèm screenshot): nền teal đặc phủ quanh cả grid ảnh lẫn caption nhìn nặng/dated, đặc biệt khi có ảnh nền sáng/trắng lọt vào (VD ảnh đồng hồ) bị chỏi hẳn ra so với nền teal.
- [x] 11.2 Quyết định thiết kế: theo đúng pattern các app chat phổ biến (WhatsApp/Telegram/iMessage) — ảnh KHÔNG bọc trong màu brand nữa, hiển thị trên card trung tính riêng (nền `fill/background/primary`, bo góc `radius="large"` qua `MySurface` — có shadow mềm mặc định, đồng bộ với `interactiveCard`/`unknownCard` đã dùng pattern này trong cùng file). Tín hiệu "tin nhắn đã gửi" (màu teal + đuôi bubble bất đối xứng) chuyển xuống 1 pill caption riêng bên dưới ảnh — tái dùng nguyên `styles.userBubble`/`userBubbleText` đã có sẵn cho text message, không tạo style trùng lặp.
- [x] 11.3 `styles.ts`: thêm `photoCard` (nền trung tính, `overflow:'hidden'` để clip ảnh theo góc bo của `MySurface`), `photoSingle`/`photoGrid`/`photoGridCell` (dùng chung hằng số `PHOTO_CARD_SIZE = 220`), `userImageColumn` (cột căn phải chứa card + pill caption). Xoá `imageBubbleImage`/`imageGrid`/`imageGridCell` cũ không còn dùng.
- [x] 11.4 `my-chat-image-message.tsx`: `isUser` giờ render `MyView(userImageColumn)` chứa `photoCard` (bọc `MySurface radius="large"`) + pill caption riêng (tái dùng `userBubble`/`userBubbleText`) thay vì 1 khối `userBubble` bọc chung ảnh+caption như cũ. Nhánh assistant dùng chung `photoCard`, không đổi cách hiển thị caption (vẫn plain text, không bubble).
- [x] 11.5 `tsc --noEmit`, `eslint`, `lint:tokens`, toàn bộ `jest` (176 pass, 1 suite fail có sẵn không liên quan) — sạch.
- [x] 11.6 Verify trực quan: tạm thêm `initialMessages` debug vào `playground/chat.tsx` (ảnh từ picsum.photos) để chụp screenshot xem trước bubble mới (không phụ thuộc picker thật, vốn không ổn định qua browser automation — xem ghi chú mục 9), xác nhận card trắng bo góc + shadow nhẹ + pill caption riêng hiển thị đúng như thiết kế. Đã dọn sạch code debug khỏi `playground/chat.tsx` sau khi xong (git diff rỗng).
- [x] 11.7 User re-test thủ công trên thiết bị thật, xác nhận UI bubble ảnh mới đẹp hơn — feedback tiếp theo là layout grid nhiều ảnh (xem mục 12).

## 12. Ảnh dàn hàng ngang, xuống hàng khi vượt bề rộng bubble

- [x] 12.1 Feedback: ảnh nhiều tấm nên dàn hàng ngang (không cố định 2 cột như cũ), chỉ xuống hàng khi tổng bề rộng hàng vượt quá bề rộng bubble.
- [x] 12.2 `styles.ts`: `photoGrid` bỏ `width: PHOTO_CARD_SIZE` cố định, chỉ giữ `flexDirection:'row', flexWrap:'wrap', gap`; `photoGridCell` đổi sang kích thước cố định `PHOTO_THUMB_SIZE = 100` (không còn tính theo `PHOTO_CARD_SIZE/2`) — để mỗi ảnh có size cố định, số lượng ảnh mỗi hàng tự nhiên phụ thuộc bề rộng còn lại của card thay vì luôn cố định 2 cột.
- [x] 12.3 Lần đầu thử cap bề rộng card multi-image bằng `MIN_BUBBLE_WIDTH` (thêm style `photoCardMultiWidth` riêng, chỉ áp cho multi-image) theo đúng câu chữ ban đầu của user ("khi nào quá MIN_BUBBLE_WIDTH"). User xem lại và yêu cầu đổi sang `MAX_BUBBLE_WIDTH` luôn (không cần phân biệt single/multi nữa) — đã bỏ `photoCardMultiWidth`, `photoCard` dùng chung 1 `maxWidth: MAX_BUBBLE_WIDTH` cho cả 2 trường hợp, đơn giản hoá lại code (bỏ luôn biến `isMultiImage`/conditional style trong component).
- [x] 12.4 `tsc --noEmit`, `eslint`, `lint:tokens`, toàn bộ `jest` (176 pass, 1 suite fail có sẵn không liên quan) — sạch.
- [x] 12.5 Verify trực quan qua debug `initialMessages` (picsum.photos) như mục 11.6: 2 ảnh xếp gọn 1 hàng; 5 ảnh xếp 4 ảnh/hàng rồi xuống hàng cho ảnh còn lại (đúng hành vi mong muốn ở độ rộng cột desktop) — đã dọn code debug sau khi xong.
- [x] 12.6 User re-test thủ công trên mobile → feedback tiếp theo: trên mobile bề rộng không đủ nên vẫn dư khoảng trống bên phải (do `photoCard`/`photoGrid` vẫn dựa vào `maxWidth`/shrink-wrap chứ chưa cố định số ảnh/hàng) — xem mục 13.

## 13. Cố định đúng 3 ảnh/hàng bằng width tuyệt đối (px), không dựa vào maxWidth/shrink-wrap

- [x] 13.1 Root cause: `MySurface` (bọc `photoCard`) fill hết bề ngang được cấp phát thay vì tự co theo nội dung ("hug content") — nên dù `photoGrid` không set `width` cố định, `photoCard` vẫn stretch ra hết `maxWidth: MAX_BUBBLE_WIDTH`, để lại khoảng trắng bên phải bất cứ khi nào 1 hàng có ít ảnh hơn số ảnh "đáng lẽ" vừa được bề rộng đó (rõ nhất trên mobile, cột hẹp nhưng bubble vẫn được set rộng gần hết màn hình).
- [x] 13.2 Fix theo đúng yêu cầu user ("canh width = 3x image rồi xuống dòng"): thêm hằng số `PHOTO_GRID_COLUMNS = 3`; `photoGrid` đổi từ không set `width` (shrink-wrap) sang **width tuyệt đối cố định** = `PHOTO_GRID_COLUMNS * PHOTO_THUMB_SIZE + (PHOTO_GRID_COLUMNS - 1) * gap` (=308px với thumb 100px, gap 4px) — luôn đúng 3 cột, độc lập hoàn toàn với bề rộng màn hình/cột chat.
- [x] 13.3 Thêm `alignSelf: 'flex-end'` vào `photoCard` — do `MySurface` route `alignSelf` lên container ngoài (xem `CONTAINER_STYLE_KEYS` trong `my-surface/type.ts`), fix luôn việc bản thân card (nền trắng) bị stretch theo `userImageColumn`, không chỉ riêng phần grid ảnh bên trong.
- [x] 13.4 `tsc --noEmit`, `eslint`, `lint:tokens`, toàn bộ `jest` (176 pass, 1 suite fail có sẵn không liên quan) — sạch.
- [x] 13.5 Verify trực quan qua debug `initialMessages` (5 ảnh, 1 message) — zoom vào bubble: hàng 1 đúng khít 3 ảnh không dư, hàng 2 (2 ảnh) chỉ dư đúng 1 ô trống (mức dư tối thiểu tự nhiên của mọi grid N-cột cố định khi hàng cuối không đầy, không phải bug) — đã dọn code debug sau khi xong (git diff rỗng).
- [x] 13.6 User re-test thủ công trên mobile thật → feedback tiếp theo: TH có 2 ảnh (ít hơn `PHOTO_GRID_COLUMNS`) card vẫn giữ nguyên width 3 cột, dư nguyên 1 ô — xem mục 14.

## 14. Card tự co đúng theo số ảnh khi ít hơn PHOTO_GRID_COLUMNS

- [x] 14.1 Feedback: TH chỉ có 2 ảnh, card nên tự co vừa khít 2 ảnh, không giữ nguyên width dành cho 3 cột.
- [x] 14.2 Thêm hàm `getPhotoGridWidth(imageCount)` export từ `styles.ts` — tính width theo `min(imageCount, PHOTO_GRID_COLUMNS)` cột thay vì luôn cố định `PHOTO_GRID_COLUMNS`; dùng `Spacing.x1` (import trực tiếp từ `@/theme/spacing`, giá trị spacing không đổi theo theme) làm gap thay vì cần `theme.getSpacing` (hàm này cần chạy per-message, không có sẵn theme context ở tầng style tĩnh).
- [x] 14.3 `photoGrid` style bỏ `width` tĩnh; `my-chat-image-message.tsx` truyền `width: getPhotoGridWidth(message.imageUris.length)` qua style array theo từng message cụ thể.
- [x] 14.4 `tsc --noEmit`, `eslint`, `lint:tokens`, toàn bộ `jest` (176 pass, 1 suite fail có sẵn không liên quan) — sạch.
- [x] 14.5 Verify trực quan: message 2 ảnh → card co đúng khít 2 ảnh, không dư ô thứ 3; message 5 ảnh → hàng 1 đủ 3 ảnh, hàng 2 dư đúng 1 ô (giữ nguyên hành vi mong muốn cho TH nhiều hơn 3 ảnh) — đã dọn code debug sau khi xong (git diff rỗng).
- [x] 14.6 User xác nhận ổn ("ok ổn rồi đó").
