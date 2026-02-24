# Project rules

## Tạo component mới

Khi tạo component:

1. **Folder**: đặt tên theo **kebab-case**  
   Ví dụ: `my-view`, `my-surface`, `parallax-scroll-view`.

2. **File TSX**: đặt tên theo **PascalCase**  
   Ví dụ: `MyView.tsx`, `MySurface.tsx`.  
   Entry component trong folder thường đặt trong `index.tsx` (re-export component chính).

3. **Tách type và styles** ra file riêng, cùng folder:
   - **type.ts** (hoặc **types.ts**): định nghĩa props, interface, type liên quan đến component.
   - **styles.ts** (hoặc **style.ts**): định nghĩa StyleSheet / style constants (nếu có).  
   Ví dụ cấu trúc folder:
   ```
   components/elements/my-view/
     index.tsx      # component chính (PascalCase tên component)
     type.ts        # MyViewProps, ...
     styles.ts      # StyleSheet.create(...) nếu cần
   ```

4. Import trong component: dùng path alias `@/*` (vd: `@/theme/colors`, `@/components/...`).



## Code rules
1. Dùng Optional chaining khi biến/expression phía trước có thể **null** hoặc **undefined**