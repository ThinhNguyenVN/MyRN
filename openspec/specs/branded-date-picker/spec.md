## Requirements

### Requirement: MyDatePicker single + range dùng branded custom calendar
`MyDatePicker` (single) và `MyDateRangePicker` MUST dùng branded custom calendar phía sau facade trên mọi platform — cùng month/year header và dual-wheel. Production MUST NOT phụ thuộc Expo UI DateTimePicker / `@expo/ui/community/datetime-picker`.

#### Scenario: Chọn ngày trên iOS
- **WHEN** người dùng mở `MyDatePicker` trên iOS (mobile) và chọn một ngày
- **THEN** giá trị MUST được cập nhật qua API facade hiện có (`value` / `onValueChange` hoặc tương đương) và sheet/picker MUST đóng theo UX facade đã chốt

#### Scenario: Month/year đồng bộ single và range
- **WHEN** người dùng mở single date và date range picker
- **THEN** chrome chọn tháng/năm MUST cùng pattern (prev/next + tap mở dual-wheel)

#### Scenario: Web không regress calendar
- **WHEN** mở `MyDatePicker` trên web
- **THEN** người dùng MUST vẫn chọn được ngày qua cùng branded calendar path

### Requirement: Feature không import datetime Expo UI
Import `@expo/ui` / `@expo/ui/community/datetime-picker` cho date MUST NOT nằm trong `src/features/**` hay route production.

#### Scenario: Grep features sạch
- **WHEN** tìm import datetime-picker / `@expo/ui` trong `src/features/**`
- **THEN** không có import trực tiếp phục vụ date picking
