# Coding conventions

Quy ước chung khi code trong MyRN. Đây là **convention source** cho human + agent.

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

- Folder + file chính: **kebab-case** (`my-date-picker/my-date-picker.tsx`).
- **`index.tsx` chỉ re-export** — không implement component trong `index.tsx`.
- Cùng folder bắt buộc:
  - **`type.ts`**: mọi `interface` / `type` / props. Không `export interface` trong `.tsx`.
  - **`styles.ts`**: `generateStyles(theme)` + `useThemedStyles`. Không style inline.
  - **`hooks.ts`**: (nếu có) logic hooks.

```
my-foo/
  my-foo.tsx
  index.tsx      # re-export only
  type.ts
  styles.ts
  hooks.ts       # optional
```

Import dùng alias `@/*`.

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
| `Image` (URL) | `MyImage` |
| Button / press / icon / input / sheet / spinner | `MyButton`, `MyPressable`, `MyIcon`, `MyTextInput`, `MyBottomSheet`, `MySpinner`, `MySurface` |

Ưu tiên **ContainerStyleProps** (`margin`, `padding`, `gap`, …) trên My* thay vì nhồi vào `style`.

Không bọc `View`/`MyView` chỉ để wrap **một** child không cần thiết.

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

- [ ] Types trong `type.ts`; `index` chỉ re-export
- [ ] Không inline style / inline handler trong JSX
- [ ] Dùng My* + token theme; nền `fill/background/…` đúng light/dark
- [ ] Layout size qua `useIsMobileSize`, không `Platform.OS` cho breakpoint
- [ ] Sheet + input: `useBottomSheetTextInput` nếu cần
- [ ] Không wrapper View thừa; DRY
