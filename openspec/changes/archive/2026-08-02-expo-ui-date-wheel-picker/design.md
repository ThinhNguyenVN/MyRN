## Context

Hybrid C đã áp dụng cho bottom sheet (`MyBottomSheet` → `@expo/ui/community/bottom-sheet`). `MyDatePicker` / `MyDateRangePicker` vẫn dùng calendar branded + `DatePickerShell` (mobile sheet / desktop `TriggerModal`). `MyWheelPicker` dùng `WheelPickerView` Reanimated + Confirm footer. `@expo/ui` cung cấp community DateTimePicker / Picker và Universal/SwiftUI/Compose variants, nhưng web DateTimePicker = no-op, Android không có wheel date/list thật.

Repo hiện **không** có unit test cho date/wheel; verification sheet trước đó dùng deep-link helper tạm — quy ước mới: smoke bằng Simulator/Expo Go rồi **xóa** helper trước khi merge.

## Goals / Non-Goals

**Goals:**

- Spike có bằng chứng trên iOS (và Android nếu có) để chốt engine date + wheel theo platform.
- Promote vào facade `MyDatePicker` (single) và `MyWheelPicker` khi spike pass; giữ API call sites / form adapters.
- Fallback web + desktop branded path khi Expo UI không cover.
- Unit test cho logic thuần (format/parse, confirm commit, chọn engine theo platform nếu tách module).
- Simulator smoke playground + cleanup helper tạm bắt buộc trong tasks.
- Cập nhật docs / delta `expo-ui-system-presentation` cho date/wheel.

**Non-Goals:**

- Pixel-perfect calendar branded trên native picker.
- Bắt buộc migrate `MyDateRangePicker` hoặc year-month dual-wheel nếu thiếu API.
- Dual-mode per-instance (`mode=native|custom`) hoặc kit flag `ui.strategy`.
- Rewrite brand primitives sang Expo UI.
- E2E Detox/Maestro bắt buộc (Simulator smoke thủ công / agent-driven screenshot là đủ cho change này).

## Decisions

### 1. Spike-first, promote có điều kiện

- Phase A: playground demos với community DateTimePicker + Picker (không đổi production facade nếu spike fail).
- Phase B: chỉ migrate production facade khi acceptance platform đạt (xem Open Questions → chốt trong spike).
- **Alternatives:** Full migrate one-shot (loại vì web null + Android no wheel).

### 2. Engine selection theo platform (hybrid)

| Surface | iOS | Android | Web / desktop wide |
|---------|-----|---------|---------------------|
| Single date | Branded custom calendar | Branded custom calendar | Branded custom calendar + `TriggerModal` |
| Range date | Branded custom calendar (đồng bộ single) | Branded custom calendar | Branded custom calendar |
| Wheel list | Expo UI community `Picker` wheel | `WheelPickerView` custom | `WheelPickerView` custom |

- Facade `My*` vẫn sở hữu trigger, sheet/modal chrome, form error/required.
- Features không import `@expo/ui`.

**Alternatives:** Một path Universal only (thiếu control RN-Picker API); SwiftUI/Compose tách file không community (phức tạp hơn cho template).

### 3. Range + year-month: branded custom (đã chốt)

- `MyDateRangePicker` và year-month dual-wheel: giữ branded custom; đồng bộ chrome với single date. Không Expo UI DateTimePicker.

### 4. Testing bắt buộc

- **Unit:** helpers engine + wheel commit (`resolveIndexFromPickerSelection` cho string-tag SwiftUI); `npx dotenv -e .env.test -- yarn test`.
- **Simulator / web smoke:** iOS + web playground Date/Wheel; Android optional.
- **Cleanup:** không để deep-link/`autoOpen` trong `src/`.

### 5. Docs

- `.docs/ui-theme-standard.md`: sheet + wheel iOS = Expo UI system presentation; date = branded calendar; wheel Android/web = custom.

## Risks / Trade-offs

- **[Risk] Web DateTimePicker null** → Mitigation: luôn giữ calendar path trên web; test matrix bắt buộc cover web desktop Modal/TriggerModal.
- **[Risk] Android “wheel” thành dropdown** → Mitigation: spike so sánh UX; có thể giữ `WheelPickerView` trên Android.
- **[Risk] UX Confirm footer vs native onChange ngay** → Mitigation: facade vẫn có thể đợi Confirm trên custom; native date có thể commit on change — document trong playground.
- **[Risk] Unit test mỏng vì UI native** → Mitigation: test pure modules; simulator covers presentation.
- **[Trade-off] Visual “hệ thống” khác mock branded** → Chấp nhận theo hybrid C (giống sheet).

## Migration Plan

1. Branch `feat/expo-ui-date-wheel-picker` từ `main` (sau merge sheet).
2. Spike playground + ghi quyết định platform vào design Open Questions (cập nhật file).
3. Unit tests cho helpers trước/alongside promote facade.
4. Promote `MyWheelPicker` / `MyDatePicker` theo quyết định; regression form adapters.
5. Simulator smoke iOS (+ Android nếu có); xóa helper tạm.
6. Docs + lint/test/CI; archive change sau merge.

**Rollback:** giữ custom calendar/wheel; spike-only demos có thể revert độc lập.

## Open Questions

1. ~~Sau spike: Android wheel giữ custom Reanimated hay chấp nhận menu Picker?~~ **Chốt:** giữ `WheelPickerView` custom trên Android (và web); Expo UI wheel chỉ iOS.
2. ~~`MyDateRangePicker` / year-month: defer sang change sau hay cố gắng một phần trong change này?~~ **Chốt:** defer — giữ custom calendar / year-month.
3. ~~Single date trên iOS: `display` graphical vs wheel — chọn mặc định nào cho playground/production?~~ **Chốt:** single + range dùng **cùng branded calendar** (month/year + dual-wheel). Expo UI DateTimePicker không promote (khác chrome; không range). Wheel list vẫn Expo UI trên iOS.
