## ADDED Requirements

### Requirement: MyWheelPicker dùng Expo UI Picker khi platform phù hợp
`MyWheelPicker` MUST dùng engine `@expo/ui` community `Picker` (wheel) trên **iOS**. Android và web MUST giữ `WheelPickerView` custom. Confirm MUST commit đúng value đã chọn (kể cả khi native trả selection dạng string-tag).

#### Scenario: Chọn item trên iOS
- **WHEN** người dùng mở `MyWheelPicker` trên iOS và xác nhận lựa chọn (Confirm)
- **THEN** `onValueChange` MUST nhận value đúng item đã chọn

#### Scenario: Fallback Android / web
- **WHEN** chạy trên Android hoặc web
- **THEN** `MyWheelPicker` MUST dùng `WheelPickerView` và vẫn mở/chọn/đóng được; MUST NOT để trống nội dung picker

### Requirement: Feature không import picker Expo UI trực tiếp
Import picker `@expo/ui` MUST chỉ qua facade `MyWheelPicker` / module engine dưới elements.

#### Scenario: Grep features sạch
- **WHEN** tìm import `@expo/ui` / community picker trong `src/features/**`
- **THEN** không có import trực tiếp phục vụ wheel picking
