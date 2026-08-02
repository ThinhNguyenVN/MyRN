## Context

MyRN là Expo SDK 57 template (iOS / Android / Web) với design system branded: `My*` + token (`.docs/ui-theme-standard.md`). Bottom sheet native đang hỏng với `@gorhom/bottom-sheet@5.2.8` + Reanimated 4 (#16); web vẫn dùng RN `Modal` trong `MyBottomSheet`.

Expo UI (`@expo/ui`) cung cấp Universal + drop-in `@expo/ui/community/bottom-sheet` (API gần gorhom, native SwiftUI/Compose, web vaul). Full native-first cho mọi element sẽ phá brand; dual-mode từng instance (`MyButton mode=…`) tốn maintain. Hướng đã chốt: **hybrid C** — Expo UI chỉ làm engine system presentation; brand primitives giữ token.

## Goals / Non-Goals

**Goals:**

- Adopt `@expo/ui` theo quy ước hybrid C; ưu tiên fix `MyBottomSheet` trên native.
- Giữ facade `MyBottomSheet` / call sites ổn định hết mức có thể; rewrite chỗ API gorhom không map được.
- Gỡ `@gorhom/bottom-sheet` sau regression.
- Cập nhật docs UI để team/AI không nhầm Expo UI = thay design system.

**Non-Goals:**

- Rewrite `MyButton` / `MyText` / `MyChip` / list / swipe / toast / nav sang Expo UI.
- Dual-mode per-element hoặc template flag `ui.strategy` (optional A — follow-up).
- Pixel-perfect sheet branded giống gorhom custom footer/backdrop/handle.
- Bỏ Reanimated khỏi project (vẫn cần cho composite khác).

## Decisions

### 1. Hybrid C làm chuẩn kiến trúc UI

- **Brand bucket**: Button, Text, Chip, Pressable, TextInput skin, Alert… → `My*` + token.
- **System bucket**: Bottom sheet (change này); date/wheel/picker chỉ spike/promote ở change sau nếu facade sạch.
- Feature/form **không** import `@expo/ui` trực tiếp; chỉ qua facade elements.

**Alternatives:** Native-first toàn elements (loại trừ vì brand); dual-mode từng element (loại trừ vì API/matrix test).

### 2. Engine sheet = `@expo/ui/community/bottom-sheet`

- Ưu tiên drop-in `BottomSheetModal` + `present()`/`dismiss()` để gần `MyBottomSheet` hiện tại.
- Fallback: Universal `BottomSheet` nếu drop-in thiếu capability quan trọng sau spike.
- Import path: `@expo/ui/community/bottom-sheet` (không giữ alias giả qua gorhom package name lâu dài — đổi import trong facade rồi gỡ gorhom).

**Alternatives:** Vá tiếp gorhom (#2720 đã thử fail); chỉ Universal không drop-in (mất API familiar).

### 3. Rewrite facade `MyBottomSheet` theo khả năng Expo UI

- Giữ: `open` / `close`, `title`, `showClose`, `children`, `onClosed`, `pressBackdropToClose` (map sang `enablePanDownToClose` / dismiss scrim nếu có), `useScrollView` nếu vẫn meaningful.
- Bỏ / đơn giản hóa: custom `BottomSheetFooter` / `BottomSheetBackdrop` / `handleComponent` — footer đưa vào children hoặc slot React đơn giản phía trên nội dung; backdrop do native sheet xử lý.
- `BottomSheetTextInput` / FlatList: dùng export compatibility của community package (re-export RN) hoặc input branded trong sheet content.
- Web: giữ path Modal branded **hoặc** chuyển sang drop-in web (vaul) — quyết định trong spike; ưu tiên **một** path cross-platform qua Expo UI nếu behavior chấp nhận được, để bớt nhánh `isMobileSize`.

### 4. Provider & Host

- Giữ `BottomSheetModalProvider` nếu drop-in yêu cầu compatibility (thường no-op children).
- Bọc nội dung Expo UI trong `Host` theo docs Universal/community khi cần; dùng `RNHostView` nếu children RN phức tạp không mount đúng trong sheet native.
- `GestureHandlerRootView` giữ (Reanimated/gesture chỗ khác vẫn cần).

### 5. Docs

- Cập nhật `.docs/ui-theme-standard.md`: mục “System presentation vs brand primitives”; cấm dùng Expo UI thay `MyButton`/`MyText` mặc định.
- Không đổi precedence `.docs/README.md` trừ khi cần link discovery.

## Risks / Trade-offs

- **[Risk] Drop-in thiếu Footer/Backdrop** → Mitigation: redesign API facade + playground demos trước khi gỡ gorhom; checklist consumers.
- **[Risk] Form/keyboard trong sheet native kém hơn gorhom** → Mitigation: smoke form demo + `BottomSheetTextInput`; điều chỉnh `keyboardBehavior` props nếu được hỗ trợ (nhiều prop chỉ no-op — ghi rõ trong design/tests).
- **[Risk] `Host` / nested RN views layout sai** → Mitigation: spike playground trước rewrite rộng; `RNHostView` khi cần.
- **[Risk] Visual sheet “hệ thống” khác mock cũ** → Mitigation: chấp nhận theo hybrid C; cập nhật docs/expectation.
- **[Risk] `@gorhom/portal` vẫn cần cho toast** → Mitigation: không gỡ portal cùng lúc trừ khi audit xong.
- **[Trade-off] Web path đổi (Modal → vaul)** có thể khác UX → Mitigation: spike so sánh; có thể tạm giữ Modal web nếu vaul regress nặng (ghi Open Question).

## Migration Plan

1. Spike: cài `@expo/ui`, playground màn sheet tối thiểu với community BottomSheetModal.
2. Rewrite `MyBottomSheet` + cập nhật import consumers (`BottomSheetView`, TextInput, FlatList).
3. Regression: playground bottom-sheet, dropdown, date-picker, wheel-picker, form-in-sheet (iOS Simulator + web tối thiểu; Android nếu có).
4. Gỡ `@gorhom/bottom-sheet` khỏi `package.json`; dọn provider/import chết.
5. Docs + đóng #16.
6. (Không trong change) Optional A / date-picker Expo engine.

**Rollback:** giữ branch; nếu blocker, revert facade về gorhom tạm (biết native vẫn broken trên Expo Go) hoặc giữ Expo UI + flag web Modal only.

## Open Questions

1. ~~Web: chuyển hẳn sang drop-in (vaul) hay giữ RN `Modal` branded cho `!isMobileSize`?~~ **Chốt:** giữ RN `Modal` branded cho non-mobile; mobile (mọi platform, kể cả web hẹp) dùng Expo UI community sheet.
2. ~~Footer trong demos playground: chuyển thành children cố định đáy sheet hay bỏ footer sticky?~~ **Chốt:** giữ prop `footer` trên facade; render flow sau body (không sticky/absolute gorhom Footer).
3. ~~Sau change này có spike ngay `MyDatePicker` / `MyWheelPicker` sang Expo UI không, hay chỉ sheet?~~ **Chốt:** chỉ sheet trong change này; date/picker Expo engine = follow-up.
