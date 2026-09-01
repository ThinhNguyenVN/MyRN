# Coding conventions

Quy ước chung khi code trong MyRN. Đây là **convention source** cho human + agent (có thể tiếng Việt).

Product kickoff / architecture reading order: `.docs/product-kickoff.md` + `.docs/README.md` (English). File này chỉ quy ước viết code.

Cursor rules (always injected):

| Rule file | Scope |
|-----------|--------|
| `.cursor/rules/coding-conventions.mdc` | Checklist chung (always) |
| `.cursor/rules/component-file-structure.mdc` | Folder / `type.ts` / `styles.ts` |
| `.cursor/rules/no-inline-render-handlers.mdc` | Không inline handler trong JSX |
| `.cursor/rules/no-inequality-null.mdc` | `isNil` thay `!= null` |
| `.cursor/rules/thunk-feature-flow.mdc` | RTK createApi + thunk |

Bản liệt kê dài hơn (cùng nội dung): `.cursor/rules.md`.

---

## 1. Cấu trúc component

**Hai layout — chọn theo phạm vi reuse.**

### A) Shared kit — `src/components/{elements,form,ui}/`

- Folder + file chính: **kebab-case** (`my-date-picker/my-date-picker.tsx`).
- **`index.tsx` chỉ re-export** — không implement component trong `index.tsx`.
- Cùng folder bắt buộc:
  - **`type.ts`**: mọi `interface` / `type` / props. Không `export interface` trong `.tsx`.
  - **`styles.ts`**: `generateStyles(theme)` + `useThemedStyles`. Không style inline.
  - **`hooks.ts`**: (nếu có) logic hooks.
  - **`utils.ts`**: (nếu có) pure helper của kit đó. Helper dùng chung app → `src/utils/`. **Không** tạo file one-off kiểu `get-foo.ts` / `foo-helper.ts` cạnh component.

```
my-foo/
  my-foo.tsx
  index.tsx      # re-export only
  type.ts
  styles.ts
  hooks.ts       # optional
  utils.ts       # optional
```

### B) Feature-only UI — `src/features/<feature>/components/`

Chỉ dùng trong feature đó → **không** đưa vào `src/components/ui`.

- **Flat**: `1 file = 1 component` (kebab-case `.tsx`).
- **Không** tạo folder con per component (`index` / `styles` / `type` riêng).
- Styles/props dùng chung: `components/styles.ts` + `components/type.ts` (hoặc `screens/styles.ts`).

```
src/features/<feature>/components/
  styles.ts
  type.ts
  order-summary-card.tsx
  status-badge.tsx
```

Import dùng alias `@/*`.

### Đặt tên hàm component — không hậu tố `Component`

Tên hàm/const của component **không** thêm hậu tố `Component` (vd `OrderSummaryCardComponent`, `TodoListViewComponent`). Hậu tố này không giúp phân biệt gì (file đã đủ context), làm identifier trong file khác với tên khi search/copy, và không khớp file name (`order-summary-card.tsx` → phải là `OrderSummaryCard`, không phải `OrderSummaryCardComponent`).

- **Không cần wrap `memo`**: đặt tên khớp file, không hậu tố. `function OrderSummaryCard() { ... }` → `export default memo(OrderSummaryCard)`.
- **Cần wrap `memo` nhưng tên export đã trùng tên file** (ví dụ file `.view.tsx` export named `XxxView`): hàm implementation dùng hậu tố **`Inner`**, không phải `Component` — theo đúng pattern đã có ở `auth`/`todo`: `function TodoListViewInner({ ... }) { ... }` → `export const TodoListView = memo(TodoListViewInner)`.
- **Ngoại lệ**: giữ nguyên hậu tố `Component` khi đó là **prop API thật** của RN/FlashList (`ListEmptyComponent`, `ListHeaderComponent`, `ListFooterComponent`, `ItemSeparatorComponent`, `CellRendererComponent`, …) — không đổi tên các prop này.

### Ngưỡng tách file (khi nào là "quá dài")

Không có con số cứng, nhưng dùng các mốc sau làm tín hiệu review — vượt mốc thì tìm đường tách trước khi mở PR:

- **`container.tsx`**: nếu vượt ~150–200 dòng hoặc có hơn ~5 `useState`/`useCallback`/`useMemo` riêng lẻ, đó là container "khó scan" theo `screen-standard.md` → tách `use-<screen>.ts` (hoặc `hooks/use-<name>.ts` nếu feature đã có thư mục `hooks/`), container chỉ giữ lại wiring điều hướng (`useNavigation`, header, bottom sheet) + JSX compose.
- **`.tsx` component / view**: vượt ~350–400 dòng → tìm mảng JSX lặp lại hoặc tách biệt (vd 1 khối cho web, 1 khối cho mobile) để tách thành component riêng trong `components/`.
- **`styles.ts` dùng chung**: vượt ~400 dòng vẫn OK nếu tất cả style key đang thực sự được dùng (styles vẫn phải nằm 1 file theo layout B) — nhưng nếu 2 file `styles.ts` khác nhau (vd `screens/*.styles.ts` và `components/styles.ts`) định nghĩa **cùng một con số** (width cột, spacing, breakpoint) cho cùng 1 khái niệm UI, đó là dấu hiệu duplicate — gộp về 1 nguồn, file kia import lại thay vì định nghĩa số riêng.

---

## 2. Null / undefined

- Không `!= null` / `== null`.
- Dùng `isNil` / `!isNil` từ `lodash`.
- Optional chaining khi phía trước có thể null/undefined.
- Phân biệt riêng null vs undefined: `=== null` / `=== undefined`.

---

## 3. Elements trước React Native primitives

Trong feature / screen / hầu hết UI:

| Thay vì | Dùng |
|---------|------|
| `View` | `MyView` (trừ glue layout rất mỏng hoặc đang implement MyView) |
| `Text` | `MyText` |
| `Image` (URL) | `MyImage` (fullscreen gallery: `ImagePreview`, không `MyImage`) |
| Button / press / icon / input / sheet / spinner | `MyButton`, `MyPressable`, `MyIcon`, `MyTextInput`, `MyBottomSheet`, `MySpinner`, `MySurface` |
| Card / divider / search | `MyCard`, `MyDivider`, `MySearchInput` |
| Empty / error / skeleton loading | `MyEmptyState`, `MyErrorState`, `MySkeleton` |
| Checkbox/radio trong form | `MyFormCheckbox` |
| Form body scroll (native, field có thể bị bàn phím che) | `MyKeyboardAvoiding.ScrollView` |

Catalog quyết định + props: `.docs/shared-ui-catalog.md`.

Ưu tiên **ContainerStyleProps** (`margin`, `padding`, `gap`, …) trên My* thay vì nhồi vào `style`.

Không bọc `View`/`MyView` chỉ để wrap **một** child không cần thiết.

Form production: wrap **scroll chứa field** bằng `MyKeyboardAvoiding.ScrollView`. **Không** wrap search trên header / toolbar đỉnh list (`ExpandableSearch`, `MySearchInput` trên chrome). Input trong `MyBottomSheet` → `useBottomSheetTextInput`.

---

## 4. Style & theme tokens

- Không `style={{ marginTop: 8 }}` — đưa vào `styles.ts` (trừ style động thật từ props/state).
- Màu / spacing / radius / typography: token theme (`getColor`, `getSpacing`, …).
- Border: `border/…` tokens — không hardcode / `brand/black` làm border.
- Shadow: **`MySurface` + `elevation="soft/…"`** — không `shadowColor` / `elevation` số trong StyleSheet.
- Background màn hình: ưu tiên `fill/background/primary` (không dùng `brand/white` làm nền — dark mode `brand/white` là chữ sáng).

---

## 5. Handlers trong render

- Không arrow mới trong JSX: `onPress={() => …}`, `renderItem={({ item }) => …}`, `renderContent={(c) => …}`.
- Tách `useCallback` / named function, truyền reference.
- OK: `onPress={handlePress}`, `onSelectIndex={setIndex}` (setter `useState`).
- Ngoại lệ: Reanimated worklets; `setState(prev => …)` trong `useCallback` (không phải JSX).

---

## 6. Conditional render

Ưu tiên `ConditionRenderer` khi có fallback:

```tsx
<ConditionRenderer when={!!data} fallback={<Empty />}>
  {content}
</ConditionRenderer>
```

---

## 7. Mobile vs desktop layout

- Phân nhánh **kích thước**: `useIsMobileSize()` / `isMobileSize` từ dimensions hooks/constants.
- **Không** dùng `Platform.OS` để quyết định mobile/desktop layout.
- `Platform.OS` chỉ cho API/platform-native (picker engine, permission, …).

---

## 8. Bottom sheet + text input

`MyTextInput` trong `MyBottomSheet` → bắt buộc `useBottomSheetTextInput` (dùng `BottomSheetTextInput` re-export từ facade sheet).

---

## 9. Data / async (tóm tắt)

Chi tiết: `.docs/data-state-standard.md` + `.cursor/rules/thunk-feature-flow.mdc`.

- API contracts trong `createApi`.
- Thunk cho orchestration phức tạp; slice reducer pure sync.
- Normalize lỗi network; một source of truth runtime trong Redux.

---

## 10. DRY & scope

- Logic/UI giống 2+ chỗ → gộp, không copy-paste.
- Không sửa ngoài phạm vi task; không markdown/docs thừa trừ khi được yêu cầu.
- Branch: `feat/` | `fix/` | `issue/` | `release/` — không `cursor/`.

---

## Checklist trước khi coi xong task UI

- [ ] Types trong `type.ts`; `index` chỉ re-export; styles trong `styles.ts` (không `generateStyles` trong `.tsx`)
- [ ] Không inline style / inline handler trong JSX
- [ ] List `key` có prefix ổn định (không bare `item.id`)
- [ ] Dùng My* + token theme; nền `fill/background/…` đúng light/dark
- [ ] `isWeb` / `isNil` / `useIsMobileSize` đúng chỗ (không `Platform.OS` cho breakpoint / web flag UI)
- [ ] Sheet + input: `useBottomSheetTextInput` nếu cần
- [ ] Form có text input (không phải header search): `MyKeyboardAvoiding.ScrollView` cho body scroll
- [ ] `app/` mỏng; screen production dưới `features/…/screens`
- [ ] Không wrapper View thừa; DRY; `yarn lint` sạch lỗi
