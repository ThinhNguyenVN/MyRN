# todo-structure-reference

## Purpose

`src/features/todo` + route `/todo` là canonical structure reference cho RTK Query CRUD pattern (list/form screen split, optimistic update). Feature này tồn tại để một AI session mới hoặc dev mới có ví dụ chạy được thật, không phải để trở thành business feature. Backported từ my-store Step 8 hardening (PR https://github.com/ThinhNguyenVN/my-store/pull/29) sau khi phát hiện: khi một product đổi `EXPO_PUBLIC_API_BASE_URL` sang backend thật, `todoApi` (vốn dùng chung `API_BASE_URL`) sẽ lỗi 404 vì DummyJSON endpoints không tồn tại trên backend đó.

## Requirements

### Requirement: `todo` là canonical structure reference

`src/features/todo` + route `/todo` MUST tồn tại trong repo làm canonical structure reference cho RTK Query CRUD pattern. Sản phẩm build trên platform này MAY ẩn `todo` khỏi nav chính, nhưng KHÔNG NÊN xóa hẳn trừ khi có lý do cụ thể — nó là ví dụ mẫu cho session AI tiếp theo.

#### Scenario: Product mới bắt đầu từ template

- **WHEN** một AI session hoặc dev clone/tạo product mới từ template này
- **THEN** `src/features/todo` MUST còn nguyên làm ví dụ RTK Query, độc lập với domain feature của product mới

### Requirement: `todo` chạy độc lập với API host của product

`todoApi` (`src/features/todo/todo-api.ts`) MUST gọi cố định `DUMMYJSON_BASE_URL` (`https://dummyjson.com`, khai báo tại `src/constants/api.ts`) qua override `baseUrl` của `axiosBaseQuery`, KHÔNG được phụ thuộc `EXPO_PUBLIC_API_BASE_URL`. Mọi endpoint (`getTodos`, `getTodoById`, `createTodo`, `updateTodo`, `deleteTodo`) MUST truyền `baseUrl: DUMMYJSON_BASE_URL`.

#### Scenario: Product đổi API host thật

- **WHEN** product cấu hình `EXPO_PUBLIC_API_BASE_URL` trỏ về một backend thật bất kỳ (không phải DummyJSON)
- **THEN** màn `/todo` (list/create/edit/delete) vẫn hoạt động bình thường vì gọi thẳng `DUMMYJSON_BASE_URL`, không qua `API_BASE_URL`
