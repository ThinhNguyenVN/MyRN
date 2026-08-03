## 1. Setup & cleanup

- [x] 1.1 Tạo branch `feat/product-ui-kit-gaps` từ `main`
- [x] 1.2 Xóa file rác `src/components/elements/picker-engine/type 2.ts` (và `openspec/specs/picker-facade-test-coverage 2` nếu còn trên disk)
- [x] 1.3 Xác nhận conventions: đọc `.docs/coding-conventions.md` + rules `component-file-structure` / `no-inline-render-handlers` / `no-inequality-null` trước khi code

## 2. Layout primitives — MyDivider + MyCard

- [x] 2.1 Implement `my-divider/` (`type.ts`, `styles.ts`, `my-divider.tsx`, `index` re-export only) — horizontal/vertical, border tokens
- [x] 2.2 Unit test `MyDivider` (orientation / helper nếu có)
- [x] 2.3 Implement `my-card/` compose `MySurface` + padding/radius; optional `onPress` → `MyPressable` — không inline handlers
- [x] 2.4 Unit test `MyCard` (press callback; render children)
- [x] 2.5 Playground entries cho Divider + Card (tĩnh + pressable)

## 3. List async UI — MyEmptyState + MyErrorState + MySkeleton

- [x] 3.1 Implement `my-empty-state/` (title, subtitle?, CTA?) — `ConditionRenderer` khi phù hợp
- [x] 3.2 Unit test `MyEmptyState` (CTA gọi `onActionPress`)
- [x] 3.3 Implement `my-error-state/` (message/title + retry)
- [x] 3.4 Unit test `MyErrorState` (retry gọi `onRetry`)
- [x] 3.5 Implement `my-skeleton/` presets `listRow` | `textBlock` | `card` (+ `count?`); wrap lib skeleton hiện có
- [x] 3.6 Unit test `MySkeleton` (preset/count helper hoặc render smoke-level)
- [x] 3.7 Playground entries Empty / Error / Skeleton
- [x] 3.8 Wire todo list: initial loading → `MySkeleton`; empty → `MyEmptyState`; fetch error → `MyErrorState` + retry; migrate ít nhất một row sang `MyCard` nếu hợp lý

## 4. MySearchInput

- [x] 4.1 Implement `my-search-input/` compose `MyTextInput` (search icon, clear khi có value, `returnKeyType="search"`); dùng `isNil` / clear handler ổn định
- [x] 4.2 Unit test clear behavior + helper `shouldShowSearchClear` nếu tách
- [x] 4.3 Playground entry Search Input

## 5. MyFormCheckbox

- [x] 5.1 Implement `form/adapters/my-form-checkbox.tsx` mirror `MyFormSwitch` (support `type` checkbox/radio của element)
- [x] 5.2 Export adapter từ form index/barrel nếu project có pattern export
- [x] 5.3 Unit test form binding (toggle cập nhật field value trong `MyForm` harness)
- [x] 5.4 Thêm field `MyFormCheckbox` vào playground form demo
- [x] 5.5 (Optional) `MyFormRadioGroup` chỉ nếu playground chứng minh cần trong apply — mặc định skip

## 6. Playground catalog — UI/element đã có nhưng chưa demo

- [x] 6.1 Playground `collapsible` — demo `Collapsible` mở/đóng
- [x] 6.2 Playground `image-slider` — demo `ImageSlider` (+ preview nếu sẵn có)
- [x] 6.3 Playground `spinner` — demo `MySpinner` sizes/colors
- [x] 6.4 Playground `surface` — demo `MySurface` elevations
- [x] 6.5 Thêm links + i18n cho 4 entry trên vào `PLAYGROUND_LINKS` / `en.json` / `vi.json`

## 7. Docs & catalog (kit mới)

- [x] 7.1 Cập nhật `.docs/ui-theme-standard.md` — liệt kê 7 components + khi dùng empty/error/skeleton
- [x] 7.2 Đảm bảo playground index link tới mọi demo kit mới (divider, card, empty-state, error-state, skeleton, search-input) + form checkbox
- [x] 7.3 i18n keys cho empty/error/search placeholder nếu cần (theo pattern `common.*` / `playground.*`)

## 8. Smoke + quality gate

- [x] 8.1 Smoke playground: Divider
- [x] 8.2 Smoke playground: Card (press)
- [x] 8.3 Smoke playground: EmptyState (CTA)
- [x] 8.4 Smoke playground: ErrorState (retry)
- [x] 8.5 Smoke playground: Skeleton
- [x] 8.6 Smoke playground: SearchInput (type + clear)
- [x] 8.7 Smoke playground: FormCheckbox (trong form)
- [x] 8.8 Smoke playground: Collapsible / ImageSlider / Spinner / Surface
- [x] 8.9 Smoke todo list: loading / empty / error paths (mock hoặc điều kiện dev hợp lý)
- [x] 8.10 Grep `src/` sạch `autoOpen` / smoke helper tạm
- [x] 8.11 `yarn lint` + `npx dotenv -e .env.test -- yarn test` pass
- [x] 8.12 Review diff: không implement trong `index.tsx`; không `!= null`; không inline JSX handlers; styles trong `styles.ts`
- [x] 8.13 Sync OpenSpec → main specs + archive sau khi merge PR
