## Why

Sau upgrade Expo SDK 57, `@gorhom/bottom-sheet` không present được trên iOS/Android (issue #16) trong khi web Modal vẫn chạy. Đồng thời project cần hướng rõ ràng khi adopt `@expo/ui`: giữ **brand/token** cho primitives (`MyButton`, `MyText`, …) và chỉ dùng Expo UI làm **engine** cho system presentation (sheet, sau đó date/picker nếu phù hợp) — hybrid kiểu C, không native-first toàn bộ elements, không dual-mode từng instance.

## What Changes

- Cài `@expo/ui` (pin exact theo SDK 57) và adopt **Universal / community drop-in** cho bottom sheet.
- **BREAKING** (nội bộ facade): rewrite `MyBottomSheet` dùng `@expo/ui/community/bottom-sheet` (hoặc Universal `BottomSheet` nếu drop-in không đủ); gỡ phụ thuộc sâu vào gorhom (`BottomSheetFooter` / custom backdrop / handle không còn 1:1).
- Gỡ direct dependency `@gorhom/bottom-sheet` sau khi regression call sites (playground sheet, dropdown, date/wheel, form-in-sheet) pass.
- Cập nhật `.docs/ui-theme-standard.md` (và tham chiếu liên quan): Expo UI chỉ cho system presentation; brand controls vẫn token-driven.
- Đóng / cập nhật GitHub issue #16 khi native sheet hoạt động.
- **Ngoài scope change này**: dual-mode `MyButton mode=brand|native`; rewrite brand primitives sang Expo UI; template flag `ui.strategy` (optional A — follow-up); thay `MyList` / swipe / toast / navigation bằng Expo UI.

## Capabilities

### New Capabilities

- `expo-ui-system-presentation`: Quy ước hybrid — Expo UI làm engine cho system presentation (ưu tiên bottom sheet); brand primitives giữ `My*` + token; facade API ổn định cho feature/form.
- `my-bottom-sheet-expo-ui`: Hành vi `MyBottomSheet` trên native (present/dismiss) và web/desktop path; giới hạn API so với gorhom; regression consumers.

### Modified Capabilities

- (không) — chưa có capability OpenSpec hiện tại mô tả bottom sheet / UI hybrid; docs project cập nhật trong design/tasks, không delta `expo-sdk-57-runtime` / `expo-router-navigation-imports`.

## Impact

- Dependencies: thêm `@expo/ui`; gỡ `@gorhom/bottom-sheet` (và rà `@gorhom/portal` nếu chỉ còn dùng cho toast — giữ portal nếu toast/confirmation vẫn cần).
- Code: `src/components/elements/my-bottom-sheet/*`, call sites (`my-dropdown-input`, `my-date-picker`, `my-wheel-picker`, playground `bottom-sheet`, `my-text-input` BottomSheetTextInput), `src/app/_layout.tsx` (`BottomSheetModalProvider` có thể giữ no-op/compatibility).
- Docs: `.docs/ui-theme-standard.md`, có thể `canonical-references.md` / `AGENTS.md` nếu cần discovery.
- Runtime: Expo Go SDK 57 đã bao gồm Expo UI; cần smoke iOS/Android/Web.
