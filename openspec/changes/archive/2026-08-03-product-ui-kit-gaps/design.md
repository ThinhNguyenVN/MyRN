## Context

Hybrid C (sheet + wheel iOS) đã chốt. Kit `My*` + form adapters + `MyList`/Toast/Confirmation đã cover phần lớn product flow, nhưng empty/error/loading list states vẫn ad-hoc; thiếu form checkbox, search preset, divider/card. Docs (`.docs/default-behavior-rules.md`, `.docs/ui-theme-standard.md`, `.docs/coding-conventions.md`) đã định nghĩa behavior và quy ước file — change này chỉ materialize thành shared components có test.

Constraints: Expo SDK 57; không dual-mode Expo UI mới; features không import library skeleton/raw RN primitives thay `My*` khi đã có facade.

## Goals / Non-Goals

**Goals:**

- Ship 7 components theo cấu trúc folder chuẩn (`type.ts` / `styles.ts` / implement file / `index` re-export).
- Unit test + playground smoke cho **từng** component; wire empty/error/skeleton vào todo list.
- Tuân thủ chặt coding conventions (no inline JSX handlers, `isNil`, tokens, `MySurface` elevation, `useIsMobileSize` khi cần layout).

**Non-Goals:**

- Badge, avatar, FAB, segmented/content tabs, value slider, accordion group.
- Migrate thêm surface sang Expo UI.
- E2E Detox/Maestro bắt buộc (smoke thủ công / agent playground đủ).
- Redesign visual language toàn app.

## Decisions

### 1. Placement & API shape

| Component | Location | API tối thiểu |
|-----------|----------|----------------|
| `MyEmptyState` | `elements/my-empty-state` | `title`, `subtitle?`, `actionLabel?` + `onActionPress?` (hoặc `action` slot nếu cần — ưu tiên props CTA đơn) |
| `MyErrorState` | `elements/my-error-state` | `title` / `message`, `retryLabel?`, `onRetry` |
| `MySkeleton` | `elements/my-skeleton` | `preset?: 'listRow' \| 'textBlock' \| 'card'`, `count?`, hoặc `layout` escape hatch; `isLoading` default true khi dùng như placeholder |
| `MyFormCheckbox` | `form/adapters` | Mirror `MyFormSwitch`: `name`, label props, bind `checked`/`onValueChange`; support `type="checkbox" \| "radio"` từ element |
| `MySearchInput` | `elements/my-search-input` | Thin wrapper `MyTextInput`: default search icon, clear when có value, `returnKeyType="search"`, forward còn lại |
| `MyDivider` | `elements/my-divider` | `orientation?: 'horizontal' \| 'vertical'`, inset/margin via `ContainerStyleProps` |
| `MyCard` | `elements/my-card` | `children`, padding/radius tokens, `elevation?`, `onPress?` → `MyPressable` + `MySurface` |

**Alternatives:** Đặt Card/Empty dưới `ui/` — loại vì đây là building blocks tái dùng như elements khác; `ui/` giữ composite (list, toast).

### 2. Skeleton: wrap lib hiện có, không viết animation mới

- Dùng `react-native-reanimated-skeleton` (đã có + shim linear-gradient).
- Preset layout tokenized trong `my-skeleton` để todo/playground/`MyImage` dần migrate (MyImage có thể giữ skeleton nội bộ trong change này — **không bắt buộc** refactor MyImage trừ khi trivial).
- **Alternatives:** chỉ document pattern — loại vì docs đã yêu cầu shared loading treatment.

### 3. Form checkbox vs radio group

- Phase 1: `MyFormCheckbox` cho boolean / single checkbox và `type="radio"` khi caller tự quản lý group value (cùng pattern element hiện tại).
- `MyFormRadioGroup` riêng: **chỉ thêm nếu** trong implement thấy form playground cần group API rõ; nếu không, document “dùng nhiều `MyFormCheckbox type=radio` + field value” và defer group helper.
- **Alternatives:** chỉ checkbox boolean — loại vì element đã có radio mode.

### 4. Search = preset, không fork TextInput

- `MySearchInput` compose `MyTextInput`; không duplicate skin.
- Clear button: hiện khi `!isNil(value) && value !== ''`; `onClear` gọi `onChangeText?.('')` / tương đương.
- **Alternatives:** chỉ docs “dùng startIcon trên MyTextInput” — loại vì product hay cần clear + search semantics.

### 5. Card vs Surface

- `MyCard` = opinionated composition (padding + radius + optional press), không thay `MySurface`.
- List row todo có thể migrate dần sang `MyCard` trong change (ít nhất một call site) để chứng minh.

### 6. Conventions (bắt buộc khi implement)

- Folder kebab-case; **không** implement trong `index.tsx`.
- Mọi props/types trong `type.ts`; styles trong `styles.ts` + `useThemedStyles`.
- Không `!= null`; dùng `isNil` / `!isNil`.
- Không inline handler trong JSX (`onPress={() => …}`, inline `renderItem`).
- Prefer `MyView`/`MyText`/`MyButton`/`MyIcon`/`MyPressable`/`MySurface`; background `fill/background/primary`; border tokens; shadow qua `MySurface` elevation.
- Prefer `ConditionRenderer` khi có fallback.
- Layout mobile/desktop: `useIsMobileSize()` — không `Platform.OS` cho layout.

### 7. Testing strategy

**Unit (mỗi component):**

- Logic thuần tách helper nếu có (vd. `shouldShowSearchClear(value)`, preset layout builders) → `*.test.ts`.
- Render tests với `@testing-library/react-native` cho behavior: CTA gọi callback; Error retry; Search clear; Divider orientation style presence; FormCheckbox đổi field value (wrap `MyForm` test harness nếu cần); Skeleton render preset count; Empty không crash khi thiếu subtitle.
- Chạy: `npx dotenv -e .env.test -- yarn test`.

**Smoke (mỗi component):**

- Playground route riêng hoặc section trong một `playground/product-kit` / routes tách (`empty-state`, `error-state`, …) — ưu tiên **một route catalog** `playground/product-ui-kit` + deep sections **hoặc** routes riêng nếu đã là pattern playground hiện tại (mỗi control một route) → **chốt: mỗi component một playground entry** giống checkbox/switch để smoke độc lập.
- Smoke checklist trong tasks: mở playground → thấy UI → tương tác cơ bản (press CTA/retry/clear/toggle) → không crash.
- **Cleanup:** không commit `autoOpen` / deep-link smoke helper trong `src/`.

### 8. Docs & cleanup

- Cập nhật `.docs/ui-theme-standard.md` liệt kê 7 components + khi dùng empty/error/skeleton.
- Xóa `src/components/elements/picker-engine/type 2.ts`.
- Xóa/ignore artifact trùng `openspec/specs/picker-facade-test-coverage 2` nếu tồn tại trên disk.

## Risks / Trade-offs

- **[Risk] RNTL + Skia/Reanimated flake** → Mitigation: unit ưu tiên helper + shallow behavior; skip heavy animation asserts; smoke covers visual.
- **[Risk] Scope creep MyImage / toàn bộ todo styles** → Mitigation: wire empty/error/skeleton vào todo list; card migrate một row; không redesign toàn feature.
- **[Risk] Radio group form UX mơ hồ** → Mitigation: Decision 3 — adapter trước, group optional.
- **[Trade-off] MySearchInput mỏng** → Chấp nhận; giá trị là API ổn định + clear/search defaults.

## Migration Plan

1. Branch `feat/product-ui-kit-gaps` từ `main`.
2. Implement elements + form adapter theo thứ tự: Divider/Card → Empty/Error/Skeleton → Search → FormCheckbox (dependency thấp → cao).
3. Unit tests song song từng component; playground entries.
4. Wire todo list empty/error/loading; cập nhật docs.
5. Smoke playground; lint + test; archive OpenSpec sau merge.

**Rollback:** xóa facades mới; todo revert inline; không đụng data layer.

## Open Questions

1. ~~Playground: một route gộp vs nhiều route?~~ **Chốt:** nhiều entry playground (một / component hoặc group logic chặt), consistent với catalog hiện tại.
2. `MyFormRadioGroup` có làm trong change này không? **Default:** không, trừ khi form playground chứng minh cần trong apply — ghi task optional.
