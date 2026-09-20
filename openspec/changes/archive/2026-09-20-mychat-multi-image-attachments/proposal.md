## Why

`MyChatComposer` hiện chỉ cho chọn **1 ảnh** và gửi **ngay lập tức** khi user chọn xong (`runPick` → `onSendImage(uri)`), không có bước xem lại/xoá/thêm trước khi gửi. Đây là gap đã được ghi nhận sẵn trong `mychat-chat-ui` spec (follow-up "preview, upload, đa ảnh"). Sản phẩm chat cần trải nghiệm đính kèm ảnh giống các app nhắn tin phổ biến: chọn nhiều ảnh (tối đa 5), xem trước dạng dải thumbnail ngay trong composer, xoá/thêm ảnh trước khi gửi, và chỉ gửi lên list tin nhắn khi user bấm Send. Ảnh gốc từ camera/thư viện cũng thường rất nặng (nhiều MB, cạnh 3000-4000px) nên cần resize trước khi hiển thị/gửi để tránh giật FlashList và tốn bộ nhớ.

## What Changes

- Composer cho chọn **nhiều ảnh cùng lúc** từ thư viện (native `selectionLimit`, web multi-select input), tối đa **5 ảnh** mỗi lượt gửi; nếu picker trả về nhiều hơn số slot còn trống thì tự động cắt bớt và hiện toast cảnh báo. Nút chọn ảnh vẫn giữ action sheet "Take Photo / Choose from Library" trên native; camera vẫn chỉ thêm 1 ảnh mỗi lần chụp.
- Ảnh chỉ nhận loại **image** (picker đã giới hạn `mediaTypes: ['images']` từ trước — không có thay đổi cần thiết để chặn video, chỉ xác nhận lại bằng requirement/scenario cho rõ ràng).
- Sau khi chọn, ảnh được đưa vào **trạng thái chờ gửi (staged)** hiển thị thành dải thumbnail ngay phía trên ô nhập text trong `MyChatComposer`: mỗi thumbnail có nút xoá riêng; có ô "+" cuối dải để thêm ảnh (ẩn khi đã đủ 5); user gõ text cùng lúc nếu muốn.
- Nhấn **Send** mới thực sự tạo message: gộp **text + toàn bộ ảnh đã stage** thành **một** `ImageMessage` (dùng field `caption` sẵn có cho phần text), sau đó xoá sạch staged state + text input. Nếu không có ảnh nào staged, hành vi gửi text giữ nguyên như hiện tại (`TextMessage`).
- Mọi ảnh (staged preview + ảnh hiển thị trong bubble đã gửi) được **resize giữ tỉ lệ, giới hạn cạnh dài nhất 900px** (bỏ qua resize nếu ảnh gốc đã nhỏ hơn 900px) trước khi đưa vào state, để tránh ảnh gốc nặng làm chậm preview/list.
- **BREAKING** (nội bộ kit, chưa có consumer production): `ImageMessage.imageUri: string` đổi thành `ImageMessage.imageUris: string[]` (tối thiểu 1 phần tử); `ConversationEvent` case `send_image` đổi thành `send_images: { imageUris: string[]; caption?: string }`; `useConversation().sendImage` đổi thành `sendImages(imageUris: string[], caption?: string)`. Chỉ consumer hiện tại là `playground/chat.tsx` (`MockChatAdapter`), sẽ cập nhật theo trong cùng change này.

## Capabilities

### New Capabilities
(không có capability mới — mở rộng các capability MyChat đã tồn tại)

### Modified Capabilities
- `mychat-conversation-engine`: `ImageMessage` mang mảng `imageUris` (tối đa 5) thay vì 1 URI; `ConversationEvent` đổi `send_image` → `send_images`; `useConversation` đổi API `sendImage` → `sendImages`.
- `mychat-chat-ui`: `MyChatComposer` thêm bước staging (chọn nhiều ảnh, preview, xoá, thêm trước khi gửi, giới hạn 5); `MyChatImageMessage` render nhiều ảnh trong 1 bubble (grid); ảnh (staged + đã gửi) được resize giữ tỉ lệ, cạnh dài nhất 900px, bỏ qua nếu ảnh đã nhỏ hơn.

## Impact

- **Code**: `src/components/ui/chat/{types.ts, use-conversation.ts, conversation-reducer.ts, mock-chat-adapter.ts, my-chat.tsx, my-chat-composer.tsx, my-chat-image-message.tsx, styles.ts}`; `src/components/ui/image-picker/{utils.ts, type.ts, index.ts}` (thêm `pickImages` multi-select + hàm resize dùng chung).
- **Dependency mới**: `expo-image-manipulator` (resize/nén ảnh cross-platform) và `expo-file-system` (dọn file cache resize chưa gửi) — cài qua `npx expo install expo-image-manipulator expo-file-system`.
- **Consumer cần cập nhật**: `src/app/(public)/(tabs)/playground/chat.tsx` (demo dùng `MockChatAdapter`) — theo API mới `sendImages`/`imageUris`.
- Không đổi `ChatAdapter`/`ChatStreamHandlers` interface (`mychat-chat-adapter` không cần spec delta) — chỉ payload bên trong `ConversationEvent` thay đổi.
