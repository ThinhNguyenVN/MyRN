## Why

Bộ shared UI đã đủ mạnh cho form/list/feedback/media, nhưng còn thiếu các building block phổ biến khi ship product thật: empty/error/loading list states (docs đã bắt buộc trong `.docs/default-behavior-rules.md`), form adapter cho checkbox, search preset, và divider/card. Hiện các pattern này bị duplicate inline (todo, playground) hoặc thiếu hẳn — cần chuẩn hóa thành `My*` + playground + test trước khi scale feature.

## What Changes

- Thêm **7 shared components** (token-driven, tuân thủ `.docs/coding-conventions.md`):
  1. `MyEmptyState` — title, subtitle optional, CTA optional
  2. `MyErrorState` — message + retry
  3. `MySkeleton` — wrapper theme quanh `react-native-reanimated-skeleton` + preset layout (list row / text block / card)
  4. `MyFormCheckbox` — form adapter cho `MyCheckbox` (checkbox; radio group nếu API rõ trong design)
  5. `MySearchInput` — preset trên `MyTextInput` (search icon, clear, `returnKeyType="search"`)
  6. `MyDivider` — horizontal/vertical separator bằng border tokens
  7. `MyCard` — compose `MySurface` + padding/radius; optional press qua `MyPressable`
- Playground demos **bắt buộc** cho từng component mới; wire empty/error/skeleton vào canonical **todo list** (thay inline ad-hoc).
- Bổ sung playground catalog cho UI/element **đã có nhưng chưa demo**: `Collapsible`, `ImageSlider`, `MySpinner`, `MySurface`.
- **Unit test** (Jest + Testing Library khi render) và **smoke** (playground) **bắt buộc cho mỗi component mới**; cấm để lại smoke helper tạm (`autoOpen`, …) trong `src/`.
- Cập nhật `.docs/ui-theme-standard.md` (và stub liên quan nếu cần) phản ánh kit mới.
- Cleanup: xóa file rác `picker-engine/type 2.ts` (và artifact OpenSpec trùng nếu còn).

**Không** thêm badge/avatar/FAB/segmented/content tabs/slider trong change này.

## Capabilities

### New Capabilities
- `list-async-ui-states`: Quy ước `MyEmptyState`, `MyErrorState`, `MySkeleton` và cách dùng trên list/async screens (theo default-behavior-rules).
- `my-form-checkbox`: Form adapter `MyFormCheckbox` (và radio group nếu design chốt) hoàn thiện bộ `MyForm*`.
- `my-search-input`: Preset search field branded trên `MyTextInput`.
- `layout-surface-primitives`: `MyDivider` + `MyCard` cho settings/list/section layout.
- `product-ui-kit-test-coverage`: Unit + smoke bắt buộc per component; cleanup helper tạm; lint/test gate.

### Modified Capabilities
- (none) — không đổi requirement của Expo UI / date / wheel specs hiện có.

## Impact

- Code: `src/components/elements/my-{empty-state,error-state,skeleton,search-input,divider,card}/`, `src/components/form/adapters/my-form-checkbox.tsx`, playground routes, `src/features/todo` list loading/empty/error.
- Docs: `.docs/ui-theme-standard.md`; tham chiếu coding conventions khi implement.
- Dependencies: reuse `react-native-reanimated-skeleton` (đã có) — không bắt buộc package mới.
- Tests: `*.test.ts(x)` co-located hoặc cạnh component; smoke qua playground (iOS/web theo môi trường).
