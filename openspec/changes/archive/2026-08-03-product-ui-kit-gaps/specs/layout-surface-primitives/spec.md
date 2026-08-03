## ADDED Requirements

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
