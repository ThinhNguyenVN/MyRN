# Project rules

## Tạo component hoặc screen mới

Khi tạo component:

1. **Folder, File**: đặt tên theo **kebab-case**  
   Ví dụ: `my-view`, `my-surface`, `parallax-scroll-view`.

2. **Component và index**: **Không code component trong `index.tsx`**. Component viết trong file riêng, **tên file dùng kebab-case** (vd: `my-button.tsx`, `my-view.tsx`). **`index.tsx` chỉ dùng để export** (re-export default và types từ file component/type).

3. **Tách type, styles, hooks** ra file riêng, cùng folder:
   - **type.ts**: định nghĩa props, interface, type liên quan đến component.
   - **styles.ts**: **bắt buộc** — chỉ định nghĩa **một** style duy nhất trong file (một function `generateStyles(theme)` hoặc một object/StyleSheet). Component **không** viết style inline; import từ `./styles`.
   - **hooks.ts**: (nếu có) định nghĩa hooks chứa logic của component.
   Ví dụ cấu trúc folder:
   ```
     my-button.tsx  # Component chính (tên file kebab-case)
     index.tsx      # Chỉ export: export { default } from './my-button'; export type { ... } from './type'
     type.ts        # MyButtonProps, ...
     styles.ts      # Bắt buộc: chỉ 1 export — generateStyles(theme)
     hooks.ts       # (nếu có) useLogic, ...
   ```

4. Import trong component: dùng path alias `@/*` (vd: `@/theme/colors`, `@/components/...`).
5. Style cần token từ theme (màu, spacing, …): dùng **useThemedStyles** (factory nhận `theme` từ `useTheme()`), không dùng StyleSheet tĩnh hoặc hardcode.


## Code rules

1. Dùng Optional chaining khi biến/expression phía trước có thể **null** hoặc **undefined**.
2. Check value tồn tại hay không phải dùng isNil từ `lodash` (import `lodash/isNil`), không dùng != null.