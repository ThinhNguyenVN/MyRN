## MODIFIED Requirements

### Requirement: Phân tách brand primitives và system presentation
Project MUST tuân thủ hybrid: control brand (button, text, chip, pressable, text input skin, alert skin, …) MUST tiếp tục dùng facade `My*` + theme token; Expo UI MUST NOT thay các brand primitives. Expo UI MUST chỉ được dùng làm engine cho system presentation — **bottom sheet** và **wheel picker trên iOS** — thông qua facade elements. **Date pickers** (`MyDatePicker` / `MyDateRangePicker`) MUST dùng branded custom calendar (không Expo UI DateTimePicker). Feature/form MUST NOT import `@expo/ui` trực tiếp.

#### Scenario: Brand button không chuyển sang Expo UI
- **WHEN** đọc implementation production của `MyButton` sau change
- **THEN** component MUST vẫn dựa trên stack branded hiện tại (không render Expo Universal `Button` làm đường mặc định)

#### Scenario: Feature không import Expo UI trực tiếp
- **WHEN** tìm import từ `@expo/ui` trong `src/features/**` và route screens
- **THEN** không còn import trực tiếp; sheet/wheel engine MUST chỉ xuất hiện dưới `src/components/elements` (hoặc tương đương facade)

#### Scenario: Date branded; wheel Expo UI trên iOS
- **WHEN** đọc docs UI và facade `MyDatePicker` / `MyWheelPicker` sau change
- **THEN** date MUST là branded calendar; wheel trên iOS MAY dùng Expo UI sau facade; trigger/form skin MUST vẫn branded token-driven

### Requirement: Tài liệu UI phản ánh hybrid C
`.docs/ui-theme-standard.md` MUST mô tả rõ: Expo UI dành cho system presentation (bottom sheet; wheel iOS); date branded custom; brand controls vẫn token-driven; không khuyến khích dual-mode per-element; nêu fallback Android/web cho wheel.

#### Scenario: Docs có mục hướng dẫn hybrid
- **WHEN** đọc `.docs/ui-theme-standard.md` sau change
- **THEN** có đoạn quy ước phân tách brand vs system presentation, nêu bottom sheet qua `MyBottomSheet`, date custom calendar, và wheel Expo UI iOS / custom Android-web
