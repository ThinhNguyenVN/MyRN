## 1. Theme token (`src/theme/colors.ts`)

- [x] 1.1 Thêm `text.contrast = { light: palette.gray900, dark: palette.white }` vào `buildTokens`
- [x] 1.2 Thêm `icon.contrast = { light: palette.gray900, dark: palette.white }` vào `buildTokens`
- [x] 1.3 Đổi `icon.active.tertiary`: `palette.white` → `palette.gray500`
- [x] 1.4 Mở rộng type: thêm variant `ContrastVariant = 'light' | 'dark'`, cập nhật `SemanticColorStringThree` để `text/contrast/{light,dark}` và `icon/contrast/{light,dark}` hợp lệ qua `getColor()`
- [x] 1.5 Verify `getColor()` resolve đúng token mới không cần sửa logic (đã generic theo `role/state/variant`)

## 2. Migrate 13 call site `icon/active/tertiary` → `icon/contrast/dark`

- [x] 2.1 `src/app/(public)/(tabs)/playground/buttons/index.tsx` — 5 chỗ (dòng ~28, 36, 37, 46, 81)
- [x] 2.2 `src/components/ui/side-bar/sider-bar-item.tsx` — dòng ~70
- [x] 2.3 `src/components/ui/image-preview/image-preview.tsx` — 2 chỗ (dòng ~171, ~227)
- [x] 2.4 `src/components/ui/table-row-more-menu/table-row-more-menu.tsx` — dòng ~30 (`useWhiteIcon ? ... : ...`)
- [x] 2.5 `src/components/ui/floating-contact/floating-contact.tsx` — dòng ~88
- [x] 2.6 `src/components/elements/my-checkbox/my-checkbox.tsx` — dòng ~49
- [x] 2.7 `src/components/elements/my-dropdown-input/dropdown-option-row.tsx` — dòng ~84
- [x] 2.8 `src/components/elements/my-dropdown-input/styles.ts` — dòng ~182
- [x] 2.9 Grep lại `icon/active/tertiary` trong `src/` sau khi sửa — MUST không còn kết quả nào

## 3. Docs

- [x] 3.1 Cập nhật `.docs/ui-theme-standard.md` — thêm mô tả state `contrast` (đồng bộ nội dung với bản đã cập nhật ở `my-store`)
- [x] 3.2 Thêm entry `CHANGELOG.md` dưới `Unreleased` (theo quy ước đầu file — bắt buộc khi đổi shared kit code)
- [x] 3.3 Ghi chú ngắn trong comment `src/theme/colors.ts` tại vị trí `contrast` giải thích khác biệt với `active`/`inactive`

## 4. Test

- [x] 4.1 Tạo `src/theme/colors.test.ts` (kit chưa có) — assert `getColor('text/contrast/light'|'dark', TokensLight|TokensDark)` và `icon/contrast/*` trả đúng giá trị
- [x] 4.2 `yarn test` (hoặc `npx dotenv -e .env.test -- yarn test` nếu cần env) pass toàn bộ
- [x] 4.3 `yarn lint` + `yarn lint:tokens` pass

## 5. Archive

- [x] 5.1 Archive change này (`openspec archive theme-color-token-contrast-fix`), sync `specs/theme-color-tokens/spec.md` vào `openspec/specs/`
