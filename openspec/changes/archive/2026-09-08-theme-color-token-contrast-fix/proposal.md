## Why

Change tương đương đã làm ở product `my-store` (fork từ kit này) sau khi review bộ theme color: `src/theme/colors.ts` gán ladder semantic (`text/icon` × `active/inactive` × `primary..quaternary`) thẳng theo vị trí trong dải xám mà không có ràng buộc contrast tối thiểu, dẫn tới:

- `text.active.quaternary` (gray300, `#d6d3d1`) chỉ đạt **~1.49:1** contrast trên nền trắng — dưới cả ngưỡng "large text" 3:1, gần như không đọc được; đồng thời nhạt hơn cả `text.inactive.primary` (gray500, ~4.8:1) — mức "active" thấp nhất lại kém rõ hơn mức "inactive" cao nhất, sai ý nghĩa `active` vs `inactive`.
- `icon.active.tertiary` bị gán cứng `white` (cả 2 theme, vì kit dùng chung 1 `buildTokens(palette)` cho cả light/dark) — phá vỡ thứ tự đơn điệu giảm dần của ladder (900 → 700 → **white** → 300), và là màu chỉ dùng được khi đặt trên nền tối/màu, nhưng tên token (`active/tertiary`) không gợi ý ràng buộc đó — dùng nhầm trên nền sáng thì icon biến mất.
- Không có token `text`/`icon` nào dành cho "chữ/icon tương phản tốt với 1 fill cụ thể" (chữ trắng trên nút Primary, chữ tối trên badge Warning sáng...) — nhu cầu này độc lập với theme light/dark app. Do thiếu token, code hiện tại lách bằng 2 cách đều vi phạm `.docs/ui-theme-standard.md` ("Do not hardcode colors"):
  - Dùng `brand/white` (token brand, sai role) làm màu chữ ở **12 file**.
  - Hardcode `'#ffffff'` trực tiếp ở **4 file** (`my-button-icon.tsx`, `my-chip.tsx`, `my-chips.tsx`, playground `chips.tsx`).

Khác với `my-store`: kit này dùng **1 hàm `buildTokens` chung** cho cả `ColorPaletteLight`/`ColorPaletteDark` (không có `buildDarkTokens` riêng với biến thể "on-tone" như `dangerOn`/`successOn`), nên **không có** bug lệch `alert.secondary` giữa 2 theme như bên `my-store` — mục đó không áp dụng ở đây.

## What Changes

- Thêm state mới `contrast` cho role `text` và `icon`, 2 variant `light` / `dark` (cùng ý nghĩa với `my-store`: chọn theo độ sáng của **1 fill cụ thể**, không phải theme app):
  - `text/contrast/light`, `icon/contrast/light` → gray900 (chữ tối, dùng trên fill sáng — kể cả `warning` solid và mọi `*Muted`).
  - `text/contrast/dark`, `icon/contrast/dark` → white (chữ trắng, dùng trên fill tối/bão hoà — brand `primary`/`secondary`, `danger`/`info`/`success` solid).
- Đổi `icon.active.tertiary` (áp dụng cho cả 2 theme vì dùng chung `buildTokens`): `white` → `gray500`, khớp `text.active.tertiary` (đã sẵn `gray500`), giữ ladder đơn điệu 900→700→500→300.
- Migrate **13 call site** đang dùng `icon/active/tertiary` sang `icon/contrast/dark` — giữ nguyên kết quả hiển thị (icon trắng).
- Mở rộng type token (`RoleState`, `SemanticColorStringThree`) hỗ trợ `text/contrast/{light,dark}` và `icon/contrast/{light,dark}`.
- Cập nhật `.docs/ui-theme-standard.md` mô tả state `contrast` mới (đồng bộ nội dung với bản đã cập nhật ở `my-store`).
- Thêm `CHANGELOG.md` entry dưới `Unreleased` (bắt buộc theo quy ước đầu file — kit thay đổi phải ghi lại để product fork biết pull gì).

**Không** trong phạm vi change này (đề xuất theo dõi riêng, tránh scope creep):

- Migrate 12 chỗ `brand/white` + 4 file hardcode `'#ffffff'` sang token mới. Không bắt buộc/không breaking nếu giữ nguyên.
- Đổi hex `active.quaternary`/`inactive.*` dù đã phát hiện contrast thấp — `border/inactive/quaternary` có 8 call site trong kit (sẽ nhiều hơn khi product dùng), cần change riêng kèm audit visual.
- `border/active/*` — kit này map `border.active` theo brand color (không phải gray, không có `white`), không có vấn đề tương tự cần sửa; giữ nguyên.
- Backport pattern "on-tone/base-tone" (`dangerOn`/`successOn`...) mà `my-store` đã thêm cho dark theme — đó là cải tiến riêng của product, chưa chắc phù hợp làm baseline kit; để riêng nếu team quyết định backport.

## Capabilities

### New Capabilities

- `theme-color-tokens`: hợp đồng semantic color token (`text`/`fill`/`icon`/`border` × state × variant) — nguyên tắc contrast tối thiểu cho ladder `active`/`inactive`, và state `contrast` độc lập theme dùng để chọn màu chữ/icon theo độ sáng của 1 fill cụ thể. (Đồng bộ với capability cùng tên đã ship ở `my-store`.)

### Modified Capabilities

- (none) — chưa có baseline spec theme trước change này trong kit.

## Impact

- Code: `src/theme/colors.ts` (token + type), 13 call site `icon/active/tertiary` (liệt kê trong `tasks.md`).
- Docs: `.docs/ui-theme-standard.md`, `CHANGELOG.md`.
- Tests: thêm `src/theme/colors.test.ts` (mới, kit chưa có test cho file này).
- Risk: thấp — mọi thay đổi giá trị đã verify bằng grep thực tế trước khi đề xuất (xem `design.md`). Product `my-store` đã ship thay đổi tương đương (PR #43) nên pattern đã được kiểm chứng thực tế.
