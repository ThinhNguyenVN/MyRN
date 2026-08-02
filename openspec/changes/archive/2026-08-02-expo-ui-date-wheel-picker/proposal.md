## Why

Sau khi migrate `MyBottomSheet` sang Expo UI (hybrid C), change này spike/promote **date** và **wheel picker** phía sau facade `My*`, có unit test + smoke, không phá brand facade.

## What Changes

- **Date (single + range):** branded custom calendar trên mọi platform (month/year header + dual-wheel đồng bộ). Expo UI DateTimePicker **không** promote; gỡ dead code (`resolveDatePickerEngine`, spike field).
- **Wheel:** Expo UI community `Picker` wheel trên **iOS**; Android/web giữ `WheelPickerView` custom. Confirm commit xử lý string-tag SwiftUI → index đúng.
- Facade `MyDatePicker` / `MyWheelPicker` / `MyDateRangePicker` giữ API; features không import `@expo/ui`.
- Desktop/`TriggerModal` + sheet padding/token dark-mode playground chỉnh theo UX.
- Unit tests: `resolveWheelPickerEngine`, `resolvePendingIndex`, `resolveIndexFromPickerSelection`, `commitWheelSelection`.
- Docs: `.docs/ui-theme-standard.md`; thêm `.docs/coding-conventions.md` + Cursor rules alwaysApply (song song change).
- Không để lại smoke helper tạm trong `src/`.

## Capabilities

### New Capabilities
- `branded-date-picker`: Quy ước date engine — branded custom calendar (single + range); không phụ thuộc community DateTimePicker.
- `expo-ui-wheel-picker-engine`: Expo UI Picker wheel trên iOS; fallback `WheelPickerView` Android/web.
- `picker-facade-test-coverage`: Unit test helpers + smoke playground; cấm smoke helper tạm trong `src/`.

### Modified Capabilities
- `expo-ui-system-presentation`: System presentation = bottom sheet + **wheel iOS**; date ở branded calendar (document rõ, không Expo UI date).

## Impact

- Code: `my-date-picker/*`, `my-wheel-picker/*`, `picker-engine/*`, playground date/wheel, bottom-sheet/date padding styles.
- Docs: `.docs/ui-theme-standard.md`, `.docs/coding-conventions.md`, `.cursor/rules/*.mdc`.
- Không đụng brand primitives (`MyButton` / `MyText`, …).
