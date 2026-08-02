## ADDED Requirements

### Requirement: Phân tách brand primitives và system presentation
Project MUST tuân thủ hybrid: control brand (button, text, chip, pressable, text input skin, alert skin, …) MUST tiếp tục dùng facade `My*` + theme token; Expo UI MUST NOT thay các brand primitives trong change này. Expo UI MUST chỉ được dùng làm engine cho system presentation (ưu tiên bottom sheet), thông qua facade elements — feature/form MUST NOT import `@expo/ui` trực tiếp.

#### Scenario: Brand button không chuyển sang Expo UI
- **WHEN** đọc implementation production của `MyButton` sau change
- **THEN** component MUST vẫn dựa trên stack branded hiện tại (không render Expo Universal `Button` làm đường mặc định)

#### Scenario: Feature không import Expo UI trực tiếp
- **WHEN** tìm import từ `@expo/ui` trong `src/features/**` và route screens (trừ playground spike tạm nếu có)
- **THEN** không còn import trực tiếp; sheet/engine MUST chỉ xuất hiện dưới `src/components/elements` (hoặc tương đương facade)

### Requirement: Tài liệu UI phản ánh hybrid C
`.docs/ui-theme-standard.md` MUST mô tả rõ: Expo UI dành cho system presentation; brand controls vẫn token-driven; không khuyến khích dual-mode per-element.

#### Scenario: Docs có mục hướng dẫn hybrid
- **WHEN** đọc `.docs/ui-theme-standard.md` sau change
- **THEN** có đoạn quy ước phân tách brand vs system presentation và nêu bottom sheet dùng Expo UI qua `MyBottomSheet`
