## ADDED Requirements

### Requirement: Ladder `active`/`inactive` MUST đơn điệu theo độ đậm, không chèn màu ngoài dải xám

Với mỗi role (`text`, `icon`), ladder `active.{primary,secondary,tertiary,quaternary}` và `inactive.{primary,secondary,tertiary,quaternary}` MUST lấy giá trị từ cùng 1 dải xám (`gray900 → gray50`) theo thứ tự giảm dần độ đậm liên tục — KHÔNG được chèn 1 màu ngoài dải xám (ví dụ `white`, hoặc màu brand) vào giữa ladder chỉ vì component cần dùng màu đó trong 1 trường hợp cụ thể. (`border` role trong kit này map `active` theo brand color thay vì dải xám — không thuộc phạm vi yêu cầu này.)

#### Scenario: Ladder `icon.active` đơn điệu
- **WHEN** đọc `icon.active.primary`, `.secondary`, `.tertiary`, `.quaternary` của 1 theme bất kỳ
- **THEN** độ sáng (luminance) của 4 giá trị này MUST tăng dần đúng thứ tự `primary < secondary < tertiary < quaternary` (theme light) hoặc giảm dần tương ứng (theme dark) — không có giá trị nào "nhảy cóc" ra ngoài dải xám gốc

#### Scenario: `active.quaternary` không được kém rõ hơn `inactive.primary`
- **WHEN** so sánh contrast (trên nền `surface`/`background` mặc định của theme) giữa `text.active.quaternary` và `text.inactive.primary`
- **THEN** `text.active.quaternary` MUST có contrast ratio ≥ `text.inactive.primary` — trạng thái "active" ở mọi mức nhấn mạnh không được kém rõ hơn trạng thái "inactive" cao nhất

### Requirement: State `contrast` độc lập với theme, dùng để chọn màu chữ/icon theo độ sáng của 1 fill cụ thể

Role `text` và `icon` MUST cung cấp state `contrast` với 2 variant `light` và `dark`, tách biệt khỏi `active`/`inactive`:

- `text/contrast/light`, `icon/contrast/light`: dùng khi đặt trên 1 nền/fill cục bộ có độ sáng **cao** (kể cả brand color sáng như `warning` solid, và mọi biến thể `*Muted`) — giá trị MUST là tông tối (tương đương `gray900` của theme đang active).
- `text/contrast/dark`, `icon/contrast/dark`: dùng khi đặt trên 1 nền/fill cục bộ có độ sáng **thấp** (brand `primary`/`secondary`, `danger`/`info`/`success` solid) — giá trị MUST là trắng.

State này KHÔNG được quyết định bởi theme app đang là light hay dark — cả 2 theme đều MUST định nghĩa đủ `contrast.light` và `contrast.dark`, vì 1 màn hình ở cùng 1 theme app vẫn có thể chứa đồng thời cả fill sáng lẫn fill tối.

#### Scenario: Chữ trắng trên fill tối
- **WHEN** 1 component đặt `fill/active/primary` (brand primary) làm background và cần chữ đọc được
- **THEN** component MUST có thể dùng `text/contrast/dark` để lấy màu trắng, không cần mượn `brand/white` hay hardcode `'#ffffff'`

#### Scenario: Chọn `contrast/light` hay `contrast/dark` phải theo luminance thực tế, không suy đoán từ tên brand color
- **WHEN** 1 component đặt 1 fill brand color (ví dụ `fill/warning/primary`) làm background
- **THEN** việc chọn `text/contrast/light` hay `text/contrast/dark` MUST dựa trên độ sáng (luminance) thực tế của giá trị hex đang active (light hoặc dark theme), KHÔNG được mặc định 1 lựa chọn cố định chỉ vì đó là "brand color" — nhất là khi giá trị hex của cùng 1 semantic color đổi khác nhau đáng kể giữa 2 theme
