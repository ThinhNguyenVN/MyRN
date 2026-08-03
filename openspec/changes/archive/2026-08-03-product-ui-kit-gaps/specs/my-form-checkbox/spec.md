## ADDED Requirements

### Requirement: MyFormCheckbox hoàn thiện bộ form adapters
Project MUST cung cấp `MyFormCheckbox` trong `src/components/form/adapters` bind `react-hook-form` qua `useFormField` / `MyFormField`, tương tự `MyFormSwitch`. Adapter MUST forward `type` checkbox/radio của `MyCheckbox` và cập nhật field value khi `onValueChange`.

#### Scenario: Toggle checkbox trong form
- **WHEN** field boolean dùng `MyFormCheckbox` và người dùng toggle
- **THEN** giá trị field trong form MUST đổi khớp trạng thái checked

#### Scenario: Features không reimplement form checkbox bridge
- **WHEN** feature cần checkbox trong `MyForm`
- **THEN** MUST dùng `MyFormCheckbox` (không tự nối `MyCheckbox` + `Controller` ad-hoc trong screen mới)

### Requirement: Playground form demo cover MyFormCheckbox
Playground form (hoặc demo checkbox form) MUST có ít nhất một field dùng `MyFormCheckbox` để smoke và làm usage catalog.

#### Scenario: Playground hiển thị form checkbox
- **WHEN** mở playground form/checkbox demo sau change
- **THEN** có control `MyFormCheckbox` tương tác được trong form context
