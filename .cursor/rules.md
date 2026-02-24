# Project rules

## Tạo component hoặc screen mới

Khi tạo component:

1. **Folder**: đặt tên theo **kebab-case**  
   Ví dụ: `my-view`, `my-surface`, `parallax-scroll-view`.

2. **File TSX**: đặt tên theo **PascalCase**  
   Ví dụ: `MyView.tsx`, `MySurface.tsx`.  
   Entry component trong folder thường đặt trong `index.tsx` (re-export component chính).

3. **Tách type, styles, hooks** ra file riêng, cùng folder:
   - **type.ts**: định nghĩa props, interface, type liên quan đến component.
   - **styles.ts**: định nghĩa StyleSheet / style bằng generateStyles với theme: ThemeType(nếu có). 
   - **hooks.ts**: định nghĩa tất cả hooks chứa logic của components.
   Ví dụ cấu trúc folder:
   ```
     index.tsx      # component chính (PascalCase tên component)
     type.ts        # MyViewProps, ...
     styles.ts      # ex: export const generateStyles = (theme: ThemeType)
     hooks.ts       # useLogic, ...
   ```

4. Import trong component: dùng path alias `@/*` (vd: `@/theme/colors`, `@/components/...`).
5. Style cần token từ theme (màu, spacing, …): dùng **useThemedStyles** (factory nhận `theme` từ `useTheme()`), không dùng StyleSheet tĩnh hoặc hardcode.


## Code rules

1. Dùng Optional chaining khi biến/expression phía trước có thể **null** hoặc **undefined**.