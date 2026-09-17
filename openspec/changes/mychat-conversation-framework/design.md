## Context

MyRN chưa có chat UI. Kit `My*` hiện có (`MyButton`, `MyText`, `MySurface`, `MyCard`, `MyTextInput`, `MyBottomSheet`, `MySkeleton`, `MySpinner`, `ConditionRenderer`, `image-picker`) đủ để compose một chat UI mà không cần primitive mới ở tầng thấp. Transport hiện tại 100% qua `axios` + RTK Query (`axiosBaseQuery`) — không có streaming/SSE infra nào trong repo; `ChatAdapter` là transport hoàn toàn mới, cố tình tách khỏi stack RTK Query vì bản chất khác nhau (chat streaming vs request/response CRUD). `MyList` (`components/ui/my-list`) là FlashList wrapper cho pull-to-refresh top-down list — không phù hợp cho chat (cần render bắt đầu từ đáy, auto-scroll xuống đáy, cập nhật nội dung tại chỗ khi streaming).

Repo là platform kit (nhiều product fork từ đây) — mọi thứ ship trong change này phải nằm ở `src/components/ui/` (props-driven, generic, không domain string), có playground demo, và được ghi vào `shared-ui-catalog.md`, theo đúng `platform-kit-sync.md`.

Constraint quan trọng nhất: **kiến trúc Phase 1–4 không được tạo constraint khiến Phase 5 (AI Gateway + Gemini) và Phase 6 (MCP) khó cắm vào sau** — `MyChat` và Conversation Engine tuyệt đối không được biết Gemini/OpenAI/MCP.

## Goals / Non-Goals

**Goals:**

- Ship chat UI kit hoàn chỉnh, composable, strongly-typed, 100% MyRN Design System.
- Conversation Engine tách biệt hoàn toàn khỏi UI và khỏi transport — chỉ biết `ChatMessage`/`ConversationEvent`, gọi qua `ChatAdapter` interface.
- `ChatAdapter` provider-agnostic; `MockChatAdapter` + `HttpChatAdapter` (streaming thật, cross-platform) đều tuân thủ cùng 1 interface.
- Playground chứng minh được toàn bộ workflow thật (không phải demo rời rạc từng component) — theo đúng tinh thần "nếu playground chạy tốt, Phase 5–6 chỉ cần đổi adapter".
- Interaction (options/confirmation/form) có lifecycle rõ ràng: pending → resolved, resolved là vĩnh viễn trong history.

**Non-Goals:**

- Gemini, OpenAI, AI SDK, MCP server/client thật.
- Business API / domain UI (Product, Order, Inventory, CRM...).
- Backend AI Gateway thật, real tool execution, real AI context management.
- Persist conversation qua app restart (in-memory only — xem Decision 3).
- Thêm chat như một tab/screen thật trong app (chỉ playground demo trong change này — quyết định đưa MyChat vào navigation thật là của product dùng kit).
- `MyChatRadioGroup`/rich form field types ngoài text/number/select cho `FormMessage` (giữ "simple form" đúng nghĩa).
- Voice/mic input (Gemini có mic morph sang send button) — chỉ tham khảo phần auto-grow + keyboard-avoiding của Gemini, **không** thêm voice/speech-to-text trong change này.

## Decisions

### 1. `MyChatList` là component mới, không mở rộng `MyList`

`MyList` đang ổn định cho pull-to-refresh top-down list, nhiều feature đã dùng. Chat cần: render bắt đầu từ đáy danh sách (FlashList v2 không còn prop `inverted` — dùng `maintainVisibleContentPosition.startRenderingFromBottom`), auto-scroll khi có message mới, giữ vị trí scroll khi nội dung message hiện tại streaming (resize tại chỗ, không remount). Nhồi các concern này vào `MyList` sẽ làm phức tạp API của một component đã ổn định và tạo rủi ro side-effect cho các feature không liên quan tới chat.

**Alternative đã cân nhắc:** thêm `maintainVisibleContentPosition`/stick-to-bottom config vào `MyList` — loại vì chi phí bảo trì/rủi ro regression cao hơn lợi ích tái dùng.

### 2. `ChatMessage` là discriminated union theo `kind`

```ts
interface ChatMessageBase {
  id: string
  role: 'user' | 'assistant' | 'system'
  createdAt: number
  status: 'pending' | 'streaming' | 'complete' | 'error'
  error?: { message: string }
}

type ChatMessage =
  | TextMessage | ImageMessage
  | OptionsMessage | ConfirmationMessage | FormMessage | ResultMessage
  | CustomMessage
```

Mỗi `kind` có field interaction/resolution riêng, type-narrowing đầy đủ ở compile time. Không dùng 1 shape chung + `interaction?: Record<string, unknown>` vì mất type-safety, đẩy validate xuống runtime — sai với yêu cầu "strongly typed, generic".

Không có message "typing" riêng: assistant message được tạo ngay ở `status: 'pending'`, text rỗng; bubble hiển thị typing-dots khi `pending && !text`, chunk đổ vào cùng message đó khi bắt đầu stream. Tái dùng lifecycle sẵn có thay vì thêm khái niệm song song.

**Alternative đã cân nhắc:** generic payload — loại vì lý do trên.

### 3. History in-memory only trong Phase 1–4

`useConversation` giữ `ChatMessage[]` trong React state (reducer), không ghi `src/utils/storage.ts`. Tránh quyết định premature về storage schema trước khi biết Phase 5 backend sẽ sync history thế nào. Để lại 1 seam (state do reducer sở hữu, có thể inject `initialMessages` + hook vào side-effect sau) chứ không tự ý thiết kế persistence format ngay bây giờ.

**Trade-off:** playground reset khi app restart — chấp nhận được vì đây là kit demo, không phải product feature thật.

### 4. `HttpChatAdapter` implement đầy đủ, cross-platform, dù chưa có backend thật

RN's `fetch` không đọc `ReadableStream` response body đáng tin cậy trên native (khác web) — cần strategy khác nhau theo platform, đổ chung vào 1 `ChatStreamHandlers` interface:

- Web: `fetch` + `response.body.getReader()`.
- Native: `XMLHttpRequest` (`responseType: 'text'`), đọc incremental trong `onprogress` bằng diff độ dài `responseText`, cắt theo dòng NDJSON hoàn chỉnh.
- Wire format: NDJSON-over-HTTP, mỗi dòng 1 JSON event (`chunk | message | error | done`) — tự định nghĩa, không phải chuẩn SSE thật vì SSE-qua-XHR trên native phức tạp hơn cần thiết ở giai đoạn chưa có backend xác nhận.

Test bằng MSW mock streaming endpoint (repo đã có `msw` trong devDependencies).

**Alternative đã cân nhắc:** chỉ scaffold typed interface, defer wiring thật đến Phase 5 — loại vì playground cần validate được kiến trúc streaming thật (platform khác nhau) trước khi Phase 5 phải sửa dưới áp lực có backend thật; rủi ro sai wire-format được cô lập hoàn toàn trong 1 file (`http-chat-adapter.ts`), không ảnh hưởng Engine/UI khi Phase 5 đổi format thật.

### 5. `onAction`: default behavior chỉ cho `external_link`

```ts
type MessageAction =
  | { type: 'navigate'; label: string; href: string; icon?: string }
  | { type: 'external_link'; label: string; url: string; icon?: string }
  | { type: 'custom'; label: string; id: string; payload?: unknown; icon?: string }
```

`MyChat` tự mở `external_link` qua `expo-web-browser` (đã có sẵn, không phải business logic). `navigate`/`custom` luôn forward qua `onAction(action)` do app inject — Conversation Engine/UI không biết Expo Router/React Navigation.

**Alternative đã cân nhắc:** zero default, mọi action qua `onAction` — loại vì tạo boilerplate lặp lại (mở link ngoài) cho mọi product dùng kit.

### 6. `renderCustomMessage` chỉ scope `kind: 'custom'`

Built-in kinds (`text/image/options/confirmation/form/result`) luôn render qua kit — đảm bảo interaction lifecycle (pending → resolved) không thể bị 1 product phá vỡ. Business UI thật (product card, order summary...) đi qua `kind: 'custom'` + `payload: unknown` + `customType: string`. Thiếu `renderCustomMessage` cho 1 `customType` → fallback `MyChatUnknownMessage`, không crash.

**Alternative đã cân nhắc:** cho override mọi kind — loại vì mất đảm bảo UX/lifecycle nhất quán giữa các product build trên kit.

### 7. Attachment: wire thật `pickImage`/`ImagePickerField` ngay trong Phase 1

Repo đã có picker native (bottom sheet Take Photo/Choose from Library) + web drag-drop qua `components/ui/image-picker` — dùng thẳng, không tự viết lại theo đúng nguyên tắc "không reimplement image picker nếu MyRN đã có". `MyChatComposer` gọi `pickImage`/`pickImageFromCamera`, tạo `ImageMessage` ngay khi chọn xong (chưa có upload backend thật — `ImageMessage.imageUri` là local URI, adapter thật ở Phase 5 sẽ quyết định upload flow).

### 8. Composer UX tham khảo Gemini app: auto-grow + keyboard-avoiding

Tham khảo redesign 2025–2026 của Gemini app (pill-shaped input, frosted surface, `+` mở bottom sheet Camera/Gallery, mic morph sang send button khi có text) và khảo sát thư viện `react-native-keyboard-controller` (đã có trong repo, v1.21.9) để chốt 2 quyết định:

**8a. Auto-grow theo số dòng — scoped trong `MyChatComposer`, không sửa `MyTextInput`**

`MyChatComposer` tự quản lý height của input: 1 dòng mặc định, cao dần theo `onContentSizeChange` khi user gõ nhiều dòng, tới `maxComposerHeight` (tương đương ~5–6 dòng) thì input bên trong tự scroll (không phình thêm). Logic này nằm hoàn toàn trong `components/ui/chat` (dùng `MyTextInput` với `multiline` + custom height state/animation), **không** thêm prop `autoGrow`/`maxLines` vào `MyTextInput` dùng chung — vì hiện tại chỉ chat cần hành vi này; nếu sau này có product khác cần auto-grow textarea generic, tách logic ra `MyTextInput` sẽ là một change riêng, không đoán trước bây giờ.

**Đối chiếu lại với screenshot Gemini app thật do user gửi** (không chỉ suy đoán từ redesign article): composer là 2 hàng xếp chồng (không phải 1 hàng ngang) — hàng trên là text input full-width, không có background pill/border riêng (chữ nằm thẳng trên nền card); hàng dưới là action row: `+` chỉ là icon trần (không có background/circle chrome nào), bên phải là nút gửi hình tròn **luôn hiển thị** (không ẩn/mờ khi rỗng) — khi input rỗng thì tròn màu nhạt hơn + icon mờ hơn (trạng thái disabled), khi có text thì tròn đậm hơn + icon rõ hơn (trạng thái active). Composer card có góc trên bo tròn nổi lên trên nền trang màu xám nhạt hơn (Gemini không dùng nền trắng cho toàn trang, dùng 2 sắc: trang xám nhạt + card/composer trắng). Không làm morph opacity/scale nữa — đơn giản hơn và đúng thật với ảnh chụp, **không** liên quan tới voice/mic (xem Non-Goals).

**Alternative đã cân nhắc:** thêm `autoGrow` vào `MyTextInput` ngay — loại vì tăng rủi ro regression cho 1 component dùng khắp app trong khi chỉ có 1 call site (chat) cần tính năng này lúc này.

**Animation cho resize (theo yêu cầu user, "mượt" hơn):** mọi lần đổi `inputHeight` (auto-grow theo content, toggle expand/collapse, reset khi gửi) đều gọi `LayoutAnimation.configureNext(...)` (RN core API, `easeInEaseOut`, ~180ms) ngay trước khi `setInputHeight` — không dùng Reanimated cho việc này vì `height` là 1 plain number prop của `MyTextInput` (không phải `SharedValue`), và không sửa `MyTextInput` để nhận animated height (ngoài scope, đúng tinh thần "không sửa MyTextInput dùng chung"). `LayoutAnimation` hoạt động ở tầng native-commit, không cần component con biết về Reanimated.

**8b. Keyboard-avoiding: tự dựng `paddingBottom` từ `useReanimatedKeyboardAnimation().height`, không dùng `KeyboardAvoidingView`/`automaticOffset`**

**2 vòng lặp fix thật trên device (iOS):**

1. Bản đầu tiên dùng `KeyboardAvoidingView behavior="padding"` của `react-native-keyboard-controller` mà thiếu `automaticOffset` — user test thấy bàn phím vẫn che input. Đọc lại source thư viện: `behavior="padding"` tính `paddingBottom` dựa trên `frame.value.y + frame.value.height` (vị trí + chiều cao của chính `KeyboardAvoidingView`, đo qua `onLayout`) so với vị trí bàn phím; nếu không có `automaticOffset`, `frame.value.y` chỉ relative-to-parent (không phải absolute trong window), nên khi view nằm sâu trong `(tabs)` navigation, phép tính bị lệch.
2. Thêm `automaticOffset` (đúng tiền lệ `native-fullscreen-modal.tsx` đã có sẵn trong repo) — user test lại **vẫn còn che**. `automaticOffset` phụ thuộc 1 native bridge call (`KeyboardControllerNative.viewPositionInWindow`) để lấy toạ độ absolute — không loại trừ khả năng call này fail/fallback âm thầm về giá trị relative trong build hiện tại (không xác minh được vì agent không có tool tương tác trực tiếp iOS Simulator).

**Fix cuối — bỏ hẳn `KeyboardAvoidingView`, tự tính padding từ giá trị thô:** `MyChat` tự bọc `content` bằng `Animated.View` với `paddingBottom` tính trực tiếp từ `useReanimatedKeyboardAnimation().height` (`paddingBottom: -height.value` — giá trị `height` của thư viện luôn ≤ 0, bằng `-event.height` lúc bàn phím mở, xác nhận qua source `animated.tsx`). Cách này **không cần biết vị trí view trong window** — vì root của `MyChat` vốn đã chiếm đúng toàn bộ vùng nội dung khả dụng của screen (do Expo Router tự trừ header/tab bar khi layout), chỉ cần cộng thêm đúng bằng chiều cao bàn phím vào đáy là đủ, loại bỏ hoàn toàn điểm lỗi tiềm ẩn ở bridge `viewPositionInWindow`.

Đồng thời phát hiện thêm 1 bug độc lập cùng lúc: `MyChatList` (`FlashList`) thiếu `style={{ flex: 1 }}` — không có kích thước xác định, ảnh hưởng tới layout tổng thể của cột. Đã thêm `styles.list` (`flex: 1`).

**Alternative đã cân nhắc:** `KeyboardStickyView`/`KeyboardAvoidingView` cấp cao của thư viện — loại vì cả 2 đều phụ thuộc đo đạc vị trí view (qua `onLayout`/native bridge) thay vì chỉ cần giá trị keyboard height thô; cách tự dựng padding từ `height` share value là primitive thấp nhất, ít điểm lỗi nhất, và không cần `KeyboardStickyView`'s trade-off phải tự đồng bộ padding cho FlashList (ở đây padding áp lên root, FlashList tự co theo qua flex bình thường).

**8c. Bề mặt phẳng, không shadow trên button/chip — composer card dùng shadow token thủ công, không qua `MySurface`**

Theo feedback thật khi test trên device: bubble/card/button trong chat kit đang có shadow mặc định của theme (`defaultElevation`) ở nhiều chỗ, không khớp giao diện phẳng/borderless của Gemini. **Fix:** mọi `MyButton`/`MyButton.Icon`/`MyChip` trong `components/ui/chat` MUST truyền `elevation="none"` tường minh (không dựa vào `defaultElevation` của theme). Đối chiếu screenshot Gemini thật (mục 8d) thì trang nền dùng 2 sắc — trang xám (`fill/background/secondary`) + card/composer nổi màu trắng (`fill/background/primary`) — nên `MySurface` card (`OptionsMessage`/`ConfirmationMessage`/`FormMessage`/`ResultMessage`/`MyChatUnknownMessage`) đổi sang `fill/background/primary`; `MyChat` root đổi sang `fill/background/secondary`.

**Bug nghiêm trọng thật gặp phải, đã fix:** bản đầu cho composer card dùng `<MyView elevation="soft/up/small" fillParent style={composerRoot}>` — user test thấy **toàn bộ nút `+`, actions row, nút expand biến mất**, chỉ còn input+send dính vào nhau. Root cause sau khi đọc source `my-view.tsx`/`my-surface.tsx`:

1. `fillParent` set `flex:1` (thực chất `flexGrow:1, flexShrink:1, flexBasis:0` — RN's `flex` shorthand) lên content view bên trong `MySurface`. Doc của `fillParent` ghi rõ: "Default false: content sizes to children (e.g. MyAlert). true = flex:1 fill parent — set explicitly for pressable/stretch surfaces (e.g. MyButton)." Composer là content-sized card (giống `MyAlert`), **không phải** pressable/stretch surface — dùng `fillParent` sai chỗ. Vì outer container (composer) lại tự size theo content (không có `flex`/height xác định từ `MyChat` root — nó là 1 child bình thường trong cột flex, không phải flex:1), inner content với `flexBasis:0`+`flexGrow:1` không có "extra space" nào để lớn vào → Yoga collapse content xuống gần 0, làm mọi children bên trong (input area, actions row, expand button) bị vỡ layout.
2. `MySurface.radius` chỉ nhận giá trị đều 4 góc, không hỗ trợ per-corner — `borderTopLeftRadius`/`borderTopRightRadius` trong `composerRoot` style bị `splitSurfaceStyle` âm thầm loại bỏ (không nằm trong `SurfaceStyle` type), nên góc bo tròn không bao giờ lên hình.

**Fix cuối:** bỏ hẳn `elevation`/`fillParent` khỏi `MyView` bọc composer — dùng `MyView` trần (không qua `MySurface`), tự tính shadow từ `theme.getElevation('soft/up/small')` (vẫn dùng token, không hardcode số) và áp trực tiếp vào `composerRoot` style theo platform (iOS: `shadowColor/shadowOffset/shadowOpacity/shadowRadius`; Android: `elevation` số nguyên xấp xỉ; Web: `boxShadow`) — né được cả 2 giới hạn trên vì không còn đi qua `MySurface`'s style-splitting nữa. `shadowColor: '#000'` đánh dấu `theme-exempt` (giống chính `my-surface.tsx` làm) vì tint luôn đen, chỉ đổi `shadowOpacity` theo token.

**Bài học cho tương lai:** không dùng `fillParent` trên `MyView`/`MyButton`-style component cho 1 content-sized multi-child container (danh sách/card có nhiều con xếp cột) — chỉ dùng cho surface thật sự cần `flex:1` để lấp đầy 1 parent đã có kích thước xác định.

**8d. Refinement vòng 2 — đối chiếu trực tiếp 1 screenshot Gemini app thật do user gửi**

- **Nút expand** ở góc trên-phải khu vực text input (icon `expand`/`contract`, đặt `position: absolute` chồng lên góc input thay vì chiếm chỗ trong flex row — tránh xung đột `width` vs `flex` khi để chung hàng với `MyTextInput`): tap để toggle `maxComposerHeight` giữa mức compact (120, mặc định) và mức mở rộng (320) — đơn giản hoá so với editor fullscreen riêng của Gemini thật (ngoài scope Phase 1–4), nhưng đáp ứng đúng mục đích "có thêm không gian gõ". **Bug thật đã fix:** bản đầu chỉ toggle flag `isExpanded` (nâng trần cho lần `onContentSizeChange` kế tiếp) mà không tự set `inputHeight` ngay — sự kiện đó chỉ bắn khi nội dung TextInput thật sự đổi (gõ thêm chữ), không bắn khi ta đổi flag từ bên ngoài, nên tap nút expand không thấy gì đổi cho tới khi gõ thêm. Fix: `handleToggleExpand` tự set `inputHeight` ngay lập tức (nhảy thẳng lên `EXPANDED_MAX_COMPOSER_HEIGHT` khi mở rộng, clamp xuống `MAX_COMPOSER_HEIGHT` khi thu lại). **Bug thứ 2 sau đó (race condition — "chớp rồi mất"):** đổi `height` prop khiến `TextInput` re-layout, khiến `onContentSizeChange` bắn lại ngay sau đó với content height tự nhiên (nhỏ) của nội dung hiện có — `handleContentSizeChange` nhận event này và ghi đè luôn giá trị mở rộng vừa set, revert lại gần như ngay lập tức. Fix: `handleContentSizeChange` MUST bỏ qua (no-op) khi `isExpanded === true` — trong chế độ mở rộng, chiều cao cố định ở `EXPANDED_MAX_COMPOSER_HEIGHT`, không tự co lại theo content nữa; nội dung dài hơn khung thì cuộn nội bộ (`scrollEnabled` đã có sẵn). **Bug thứ 3 (collapse không về đúng size ban đầu):** logic collapse cũ `Math.min(currentHeight, MAX_COMPOSER_HEIGHT)` — vì `currentHeight` lúc đó luôn là `EXPANDED_MAX_COMPOSER_HEIGHT` (320), collapse ra `min(320,120)=120` (mức compact cố định) chứ không phải kích thước nội dung thật sự cần (vd 24 nếu chỉ có 1 dòng ngắn). **Fix:** thêm `naturalContentHeightRef` — track riêng chiều cao "tự nhiên theo nội dung", cập nhật liên tục trong `handleContentSizeChange` **kể cả khi đang expanded** (chỉ việc *áp dụng* vào `inputHeight` bị chặn lúc expanded, việc *ghi nhớ* thì không); collapse dùng `naturalContentHeightRef.current` thay vì clamp `currentHeight`. Reset ref về `MIN_COMPOSER_HEIGHT` khi gửi tin nhắn (text bị clear).
- **Tap vào vùng chat để dismiss keyboard**: bản đầu bọc vùng list/empty-state bằng RN `Pressable` trần gọi `Keyboard.dismiss()`. User tự đổi sang dùng prop có sẵn của `FlashList` (`keyboardShouldPersistTaps="always"` + `keyboardDismissMode="interactive"` trong `my-chat-list.tsx`) — đã dọn `Pressable`/`handleDismissKeyboard` không dùng nữa khỏi `my-chat.tsx`. **Lưu ý còn tồn tại:** cách này chỉ phủ trường hợp có `MyChatList` (đã có message); `MyChatEmptyState` (chưa có message, chỉ là `MyView` thường) hiện **không** có cơ chế dismiss-on-tap riêng — cần theo dõi nếu user báo lại vẫn còn thiếu ở màn hình rỗng.
- **Nút gửi to hơn + nền xám rõ hơn**: 32px → 40px; fill inactive đổi từ `fill/inactive/tertiary` (gần trắng) sang `fill/inactive/secondary`, fill active dùng `fill/inactive/primary` — cả 2 đều rõ ràng là "xám" thay vì gần như vô hình lúc rỗng.
- **Padding dưới của text input quá lớn — root cause**: `MyTextInput`'s `inputRow` (style dùng chung toàn app) có sẵn `minHeight: 44` — clamp chiều cao tối thiểu này đè lên `height` prop nhỏ hơn (24) mà `MyChatComposer` truyền vào, tạo khoảng trắng thừa. **Fix:** override `minHeight: 0` qua `inputRowStyle` (escape hatch `MyTextInput` đã có sẵn) — không sửa `MyTextInput` dùng chung, đúng tinh thần Decision 8a.

**8e. Refinement vòng 3 — composer thành `position: absolute` overlay + animation resize dùng Reanimated thay vì `LayoutAnimation`**

Hai vấn đề user báo sau vòng 8d:

1. **`LayoutAnimation` không chạy** (không animation khi expand/collapse). Nguyên nhân nghi ngờ: tương thích không ổn định với New Architecture (Fabric) của RN 0.86 kết hợp Reanimated 4 — không có cách verify chắc chắn trên agent này. **Fix:** bỏ hẳn `LayoutAnimation`, chuyển sang cơ chế đã được chứng minh hoạt động trong chính repo (Reanimated, dùng khắp nơi khác). Vì `MyTextInput`'s `height` là plain number prop (không phải `SharedValue`, không animate trực tiếp được mà không sửa `MyTextInput`), kỹ thuật dùng: bọc `MyTextInput` trong 1 `Animated.View` (`composerInputArea`) có `overflow: 'hidden'` + `height` animate bằng `useSharedValue`/`withTiming` (180ms, `easeOut`) theo `inputHeight`. `MyTextInput` bên trong vẫn nhận `height={inputHeight}` tức thời (jump ngay), nhưng vì bị crop bởi wrapper đang animate nên mắt nhìn thấy hiệu ứng "lộ dần/thu dần" mượt — không cần sửa `MyTextInput` dùng chung. **Trade-off đã biết:** khi PHÌNH (grow) hiệu ứng mượt hoàn toàn (wrapper animate theo sau input đã instant-resize, đúng crop-reveal); khi THU (shrink — ví dụ sau khi gửi hoặc bấm collapse) có thể thấy khoảng trống ngắn vì input đã nhỏ lại tức thời nhưng wrapper còn đang animate xuống theo — chấp nhận được, ưu tiên trường hợp expand (chính là cái user yêu cầu mượt).

2. **Expand/collapse làm dịch chuyển chat content (message list)** — vì composer trước đó nằm trong luồng flex bình thường (column), composer cao lên thì list (`flex: 1`) tự co lại theo, đẩy nội dung dịch chuyển. **Fix — composer thành overlay tuyệt đối:** tách kiến trúc `my-chat.tsx` thành 2 `Animated.View` độc lập, con trực tiếp của root (không lồng nhau):
   - `listWrapper` (`flex: 1`, animate `paddingBottom` theo `-height.value` như 8b) bọc `MyChatList`/`MyChatEmptyState`.
   - `composerFloatingWrapper` (`position: 'absolute', left: 0, right: 0, bottom: 0`, animate `transform: translateY(height.value)`) bọc `MyChatComposer` — kỹ thuật `translateY` giống hệt `KeyboardStickyView` của thư viện (đã đọc source ở 8b), tách biệt hoàn toàn khỏi layout của list nên composer phình/co không bao giờ đụng tới list nữa.
   - `MyChatList`'s `listContent` (và `MyChatEmptyState`) MUST có `paddingBottom` đủ lớn để nội dung cuộn tới cuối không bị composer (ở trạng thái compact) che khuất — tính từ tổng padding/chiều cao baseline của composer qua theme token (`composerBaselineHeight` trong `styles.ts`), không phải số magic tuỳ ý.
   - Vì 2 wrapper phản ứng độc lập với cùng `height` (keyboard), khi bàn phím mở: `listWrapper` tự co (giữ đúng yêu cầu "scroll content lên để keyboard không che content" — `MyChatList`'s `maintainVisibleContentPosition.autoscrollToBottomThreshold` đã có sẵn từ đầu lo phần auto-scroll khi viewport list co lại); `composerFloatingWrapper` tự dịch lên độc lập — không còn phụ thuộc lẫn nhau qua 1 padding chung như bản 8b cũ (tránh rủi ro double-apply nếu Yoga's absolute+padding-box không hoạt động như kỳ vọng).

**Bắt buộc khi implement:** hành vi keyboard-avoiding + auto-grow + animation + composer-overlay trên MUST được verify trên thiết bị/simulator thật (không chỉ code review/lý luận) trước khi coi task hoàn thành — root layout đã set `statusBarTranslucent navigationBarTranslucent` trên `KeyboardProvider`. Agent hiện tại không có tool tương tác trực tiếp với iOS Simulator (không có idb/Appium); mọi fix trong 8b–8e dựa trên root-cause analysis + đối chiếu screenshot/feedback thật do user cung cấp, không phải agent tự mắt xác nhận trên device — user cần tự test lại và báo lại nếu vẫn còn vấn đề.

### 9. Conventions bắt buộc khi implement

- Folder `chat/` theo pattern multi-file barrel đã có tiền lệ (`components/ui/carousel`, `components/ui/confirmation`, `components/ui/my-list`): `types.ts`, `styles.ts`, `index.ts` (chỉ re-export), 1 file = 1 component.
- Không `!= null`; dùng `isNil`/`!isNil`. Không inline handler trong JSX. Theme token cho màu/spacing/radius/shadow (`MySurface` elevation, không `shadowColor` raw).
- `useIsMobileSize()` cho layout responsive — không `Platform.OS`.
- Route `playground/chat.tsx` mỏng, implementation thật nằm trong 1 demo screen riêng (không phải `src/features`, vì đây là kit playground, không phải product feature).

## Risks / Trade-offs

- **[Risk] Wire-format NDJSON của `HttpChatAdapter` có thể không khớp AI Gateway thật ở Phase 5** → Mitigation: format bị cô lập hoàn toàn trong `http-chat-adapter.ts`; `ChatAdapter` interface + `ChatStreamHandlers` không đổi, Engine/UI không bị ảnh hưởng khi đổi format.
- **[Risk] FlashList `maintainVisibleContentPosition` (`startRenderingFromBottom`) + streaming content resize có thể giật/nhảy vị trí trên native** → Mitigation: dùng `maintainVisibleContentPosition` (FlashList v2 hỗ trợ sẵn), test kỹ trên iOS Simulator trước khi coi component hoàn thành (không chỉ tin vào code review).
- **[Risk] `KeyboardAvoidingView` resize-based có thể không mượt/không đúng trong app đã set `statusBarTranslucent navigationBarTranslucent` (edge-to-edge)** → Mitigation: verify thật trên iOS Simulator (Decision 8b); nếu resize-based không đủ mượt, đổi sang `KeyboardStickyView` + đồng bộ padding cho `MyChatList` là fallback đã được cân nhắc sẵn, không phải thiết kế lại từ đầu.
- **[Risk] `MyChatList` là list primitive thứ 2 song song `MyList`, tăng bề mặt maintain** → Mitigation: chấp nhận có chủ đích (Decision 1); document rõ trong `shared-ui-catalog.md` khi nào dùng cái nào.
- **[Trade-off] History in-memory only** → chấp nhận; playground mất state khi restart, nhưng tránh thiết kế persistence sai trước khi biết backend Phase 5.
- **[Trade-off] `renderCustomMessage` không override được built-in kinds** → chấp nhận; đổi lại đảm bảo UX nhất quán, đúng nguyên tắc "MyChat không thay thế UI application, chỉ orchestrate".

## Migration Plan

1. Branch `feat/mychat-conversation-framework` từ `main`.
2. Implement theo thứ tự phụ thuộc thấp → cao: `types.ts` (ChatMessage/ConversationEvent/MessageAction) → `conversation-reducer.ts` + `use-conversation.ts` → `chat-adapter.ts` interface + `mock-chat-adapter.ts` → UI components (list → bubble → per-kind renderer → composer → action row) → `http-chat-adapter.ts` → playground demo.
3. Unit test song song reducer + adapter logic thuần.
4. Playground smoke từng message kind, sau đó smoke toàn bộ scripted workflow end-to-end.
5. Cập nhật `shared-ui-catalog.md`; lint + test; archive OpenSpec sau khi merge.

**Rollback:** xóa `src/components/ui/chat/` + route playground mới; không đụng feature/data layer nào khác (chat kit không được các feature khác import trong change này).

## Open Questions

Không còn open question — các quyết định kiến trúc chính đã được xác nhận qua interview trước khi viết proposal này (chat list primitive, message model shape, persistence, streaming transport scope, action defaults, custom renderer scope, attachment scope, entry point), và bổ sung qua interview lần 2 về composer UX (auto-grow scoped vào `MyChatComposer`, keyboard-avoiding dùng `KeyboardAvoidingView` resize-based — Decision 8).
