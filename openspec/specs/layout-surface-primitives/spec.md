## Purpose

Primitive bề mặt layout: MyDivider, MyCard dùng token theme, và hành vi mặc định của `MyPressable` / `MySurface` (`MyView` khi có `elevation`) mà mọi primitive khác build trên đó.

## Requirements

### Requirement: MyDivider dùng border tokens
Project MUST cung cấp `MyDivider` hỗ trợ orientation horizontal (default) và vertical, dùng semantic border/spacing tokens (không hardcode màu border). Layout spacing MUST ưu tiên `ContainerStyleProps` / styles theme.

#### Scenario: Horizontal divider
- **WHEN** render `MyDivider` mặc định giữa hai block nội dung
- **THEN** có đường phân tách ngang dùng token border theme

#### Scenario: Vertical divider
- **WHEN** render `MyDivider` orientation vertical trong row
- **THEN** có đường phân tách dọc và không phá layout row

### Requirement: MyCard compose MySurface
Project MUST cung cấp `MyCard` compose `MySurface` (elevation) + padding/radius tokenized. Khi có `onPress`, card MUST dùng `MyPressable` (hoặc tương đương branded pressable) — không raw `Pressable` trong feature usage. `MyCard` MUST NOT thay thế toàn bộ `MySurface` cho mọi elevation case.

#### Scenario: Card tĩnh
- **WHEN** render `MyCard` với children
- **THEN** children hiển thị trong surface có padding/radius theo default card

#### Scenario: Card nhấn được
- **WHEN** `MyCard` có `onPress` và người dùng nhấn
- **THEN** `onPress` MUST được gọi

### Requirement: Playground demo divider và card
Playground MUST demo `MyDivider` và `MyCard` (tĩnh + pressable) để smoke.

#### Scenario: Playground layout primitives
- **WHEN** mở playground divider/card demo
- **THEN** thấy divider và card; nhấn card pressable MUST chạy handler demo (Toast hoặc state) không crash

### Requirement: MyPressable chặn multi-press mặc định
`MyPressable` MUST mặc định bỏ qua một `onPress` lặp lại trong cửa sổ chặn ngắn tính từ lần press hợp lệ gần nhất trên cùng instance, để tránh double-fire (double navigation, double mutation) khi user bấm nhanh hai lần hoặc gặp double-tap giả từ hệ thống. Guard MUST tự reset khi identity của `onPress` đổi (ví dụ cell bị FlashList tái sử dụng cho item khác), để không nuốt oan lần bấm đầu tiên của item mới. Control cần bấm lặp lại nhanh (ví dụ nút tăng/giảm của `MyCounter`) MUST tắt cơ chế này qua prop dành riêng thay vì tự implement guard riêng.

#### Scenario: Bấm nhanh hai lần
- **WHEN** user bấm hai lần liên tiếp rất nhanh vào cùng một `MyPressable` có `onPress` điều hướng
- **THEN** `onPress` MUST chỉ chạy một lần cho lần bấm đầu tiên trong cửa sổ chặn

#### Scenario: Control cần multi-press tắt guard
- **WHEN** control khai báo tắt multi-press guard (ví dụ nút tăng/giảm số lượng)
- **THEN** mỗi lần bấm hợp lệ MUST đều chạy `onPress`, kể cả bấm liên tục nhanh

### Requirement: MySurface fillParent mặc định auto-size theo nội dung
`MySurface` (và `MyView` khi có `elevation`) MUST mặc định để nội dung tự co theo kích thước children (không ép `flex: 1`). Chỉ những surface cần giãn lấp đầy khung chứa (button, rail, box icon cố định) MUST khai báo tường minh để bật hành vi giãn.

#### Scenario: Card/panel mặc định
- **WHEN** một `MySurface`/`MyView` có `elevation` không khai báo prop giãn nội dung
- **THEN** nội dung MUST co theo kích thước children, MUST NOT tự giãn lấp đầy khung chứa

### Requirement: MySurface không mất shadow ở lần vẽ đầu trên Android
Trên Android, `MySurface` có `elevation` mà không có `width`/`height` tường minh MUST vẫn hiện shadow ngay ở lần vẽ đầu tiên (dùng shadow native tạm thời trước khi đo layout xong), MUST NOT hiện không có shadow rồi mới "pop-in" sau khi đo xong. iOS và Web MUST NOT bị ảnh hưởng bởi thay đổi này.

#### Scenario: Card elevation mount trên Android
- **WHEN** một card có `elevation` mount lần đầu trên Android mà chưa có kích thước tường minh
- **THEN** card MUST đã có shadow ngay từ frame đầu tiên, MUST NOT hiện trạng thái không shadow trước khi "pop-in"
