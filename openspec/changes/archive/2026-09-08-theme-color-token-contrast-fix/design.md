## Context

`src/theme/colors.ts` là nguồn duy nhất định nghĩa palette và semantic token (`buildTokens` → `text`/`fill`/`icon`/`border`), dùng chung 1 hàm cho cả `ColorPaletteLight` và `ColorPaletteDark` (khác `my-store`, nơi dark theme có `buildDarkTokens` riêng với biến thể "on-tone"). Change này port lại đúng phần đã audit + ship ở `my-store` (PR #43, OpenSpec `theme-color-token-contrast-fix` đã archive), điều chỉnh cho đúng shape hiện tại của kit.

## Goals / Non-Goals

**Goals:**

- Thêm state `contrast` (`light`/`dark`) cho `text`/`icon`.
- Dọn `white` khỏi `icon.active.tertiary` để ladder đơn điệu theo độ đậm.
- Ghi lại hợp đồng token thành spec (`theme-color-tokens`), đồng bộ với bản đã ship ở `my-store`.
- Ghi `CHANGELOG.md` để product fork (my-store và các product tương lai) biết để backport.

**Non-Goals:**

- Không đổi hex `active.quaternary`/`inactive.*` dù contrast thấp (`text/active/quaternary` ~1.49:1 trên nền trắng) — phạm vi ảnh hưởng rộng hơn khi tính cả product code kế thừa, cần change riêng.
- Không migrate `brand/white` (12 file) / hardcode `'#ffffff'` (4 file) sang token mới.
- Không đụng `border.active` (map theo brand color, không có `white`, không cùng vấn đề).
- Không thêm biến thể "on-tone" (`dangerOn`/`successOn`...) mà `my-store` tự thêm cho dark theme — quyết định backport pattern đó (nếu có) nên là 1 đề xuất riêng, có so sánh trade-off đơn giản (kit hiện tại) so với có 2 tông (my-store).

## Decisions

### 1. `contrast` là state riêng, giá trị giống hệt bản đã ship ở `my-store`

```ts
text: {
  // ...active/inactive/alert/warning/info/success giữ nguyên
  contrast: { light: palette.gray900, dark: palette.white },
}
icon: {
  // ...
  contrast: { light: palette.gray900, dark: palette.white },
}
```
Cả 2 theme (cùng dùng `buildTokens`) đều nhận state này qua tham số `palette` — không cần code riêng cho dark như `my-store`.

**Lưu ý dùng đúng:** `warning` solid (`#b45309` light / `#fcd34d` dark) là brand color đậm nhưng độ sáng thực tế biến thiên theo theme — cần kiểm tra contrast trước khi mặc định chọn `contrast/dark` (xem ví dụ tương tự đã ghi trong `.docs/ui-theme-standard.md` của `my-store`, sẽ đồng bộ nội dung này vào kit).

### 2. Dọn `white` khỏi `icon.active.tertiary` bằng `gray500`

**Quyết định:** `icon.active.tertiary` đổi từ `palette.white` → `palette.gray500` — áp dụng tự động cho cả 2 theme vì dùng chung `buildTokens`.

**Lý do:** khớp `text.active.tertiary` (đã là `gray500`) → ladder `icon.active` trở thành 900 → 700 → 500 → 300, đơn điệu giảm dần đúng nghĩa, nhất quán với `text.active`.

**Khác với `my-store`:** không cần sửa `border.active.tertiary` vì kit map `border.active` theo brand color (`primary/secondary/tertiary/quaternary`), không dùng gray/`white` — không có vấn đề tương tự.

### 3. Migrate 13 call site `icon/active/tertiary` → `icon/contrast/dark`

Danh sách (grep xác nhận, chi tiết trong `tasks.md`):
- `src/app/(public)/(tabs)/playground/buttons/index.tsx` (5 chỗ)
- `src/components/ui/side-bar/sider-bar-item.tsx`
- `src/components/ui/image-preview/image-preview.tsx` (2 chỗ)
- `src/components/ui/table-row-more-menu/table-row-more-menu.tsx` (biến `useWhiteIcon`)
- `src/components/ui/floating-contact/floating-contact.tsx` (component này không có bên `my-store`, chỉ có trong kit)
- `src/components/elements/my-checkbox/my-checkbox.tsx`
- `src/components/elements/my-dropdown-input/dropdown-option-row.tsx`
- `src/components/elements/my-dropdown-input/styles.ts`

**Rủi ro:** thấp — đổi tên token 1:1, giá trị hiển thị (trắng) không đổi.

### 4. Không có bug "on-tone/base-tone" cần fix trong kit

`my-store` có bug `text.alert.secondary` (dark) trùng `primary` vì kit đó tự thêm `dangerOn`/`successOn` cho dark theme. Kit gốc (`MyRN`) không có khái niệm "on-tone" — mọi state cảnh báo đều `primary === secondary` nhất quán ở cả `text`/`icon`/`fill` cho cả 2 theme. Không có gì để fix ở mục này; ghi nhận là điểm khác biệt so với `my-store`, không phải thiếu sót của kit.

## Risks / Trade-offs

- **[Risk] Nhầm `contrast/light` ↔ `contrast/dark` với brand color có luminance biến thiên theo theme** (khác `my-store` — ở đây `warning`/`danger` đổi hẳn giá trị giữa light/dark, không chỉ đổi độ sáng nhẹ) → Mitigation: ghi ví dụ cụ thể trong doc, kèm cảnh báo "không suy đoán, luôn tính lại contrast khi đổi palette".
- **[Trade-off] Không backport "on-tone" pattern của `my-store`** → Chấp nhận; đây là cải tiến sâu hơn, cần thảo luận riêng có nên làm baseline kit hay để mỗi product tự quyết.
- **[Trade-off] Không migrate `brand/white`/hardcode `#ffffff` ngay** → Chấp nhận, giữ change nhỏ dễ review, theo dõi bằng backlog riêng.

## Migration Plan

1. Sửa `src/theme/colors.ts`: thêm `contrast.{light,dark}` cho `text`/`icon`, đổi `icon.active.tertiary` → `gray500`, mở rộng type.
2. Migrate 13 call site `icon/active/tertiary` → `icon/contrast/dark` (cùng lúc bước 1).
3. Cập nhật `.docs/ui-theme-standard.md` + `CHANGELOG.md` (`Unreleased`).
4. Thêm test `src/theme/colors.test.ts` cho token mới.
5. `yarn lint` + `yarn lint:tokens` + `yarn test` (hoặc `npx dotenv -e .env.test -- yarn test` nếu cần env) pass.
6. Smoke thủ công (không tự động chạy trừ khi được yêu cầu): playground `buttons`, `table-row-more-menu`, `my-checkbox`, `dropdown-option-row`, `floating-contact` — xác nhận icon vẫn trắng như cũ.

**Rollback:** revert `colors.ts` + 13 call site về `icon/active/tertiary`; không ảnh hưởng data/API.

## Open Questions

1. Có nên backport pattern "on-tone" (`dangerOn`/`successOn`...) từ `my-store` vào kit baseline? — **Để riêng**, không quyết trong change này.
2. `getContrastText(hex)` helper tự động — để riêng, giống quyết định đã chốt ở `my-store`.
