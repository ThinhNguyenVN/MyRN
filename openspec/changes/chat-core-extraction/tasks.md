## 1. Mốc trước khi đổi

- [x] 1.1 Trên `main` sạch: chạy `yarn check:types`, `yarn lint`, `npx dotenv -e .env.test -- yarn test`, ghi số test pass làm mốc — mốc (bỏ bản sao trong `.claude/worktrees/`): types ✓, lint ✓, lint:tokens ✓, test 39 suites / 219 pass
- [ ] 1.2 Chạy playground chat (`/playground/chat`) trên iOS, Android, web; ghi lại luồng đã thử (text streaming, options, confirmation, form, ảnh, retry) — chưa chạy trên máy/simulator. Headless: `expo export` web/iOS/Android bundle được; web export chạy mock flow text streaming → options → form

## 2. Tạo package

- [x] 2.1 Root `package.json`: `"workspaces": ["packages/*"]`; dependency `"@thinhnguyenvn/chat-core": "*"` (workspace)
- [x] 2.2 `packages/chat-core/package.json`: tên, `version: 0.1.0`, `main`/`types` trỏ `dist/`, `files`, peer `react` và `react-native`, script `build`, `typecheck`, `prepublishOnly`
- [x] 2.3 `packages/chat-core/tsconfig.json`: không có `paths`, `outDir: dist`, CommonJS, ES2020, `declaration: true`; `tsconfig.build.json` loại file test
- [x] 2.4 `README.md` (cài đặt, API, bảng version → contract) và `CHANGELOG.md` (`0.1.0`)

## 3. Chuyển core

- [x] 3.1 `git mv` `types.ts`, `conversation-reducer.ts`, `use-conversation.ts`, `chat-adapter.ts`, `http-chat-adapter.ts`, `mock-chat-adapter.ts`, `generate-message-id.ts` và test của chúng vào `packages/chat-core/src/`; thêm `src/index.ts` export đúng danh sách `index.ts` UI đang export
- [x] 3.2 `http-chat-adapter.ts`: `isWeb` → `Platform.OS === 'web'`; bỏ import `@/utils/storage`, `ChatSessionScope` thêm `storage: ChatSessionStorage`; giữ key `chat.session.<app>.<user>`
- [x] 3.3 `http-chat-adapter.test.ts`: thay mock `@/utils/storage` bằng storage giả truyền qua `session`; thêm test "đọc id đã lưu dưới key cũ" và "ghi id mới qua `storage.setItem`"
- [x] 3.4 `RenderCustomMessage` chuyển sang UI (file type của `my-chat`), sửa import ở `my-chat.tsx`, `my-chat-list.tsx`, `my-chat-bubble.tsx`
- [x] 3.5 `contract/` ở gốc → `packages/chat-core/contract/`; sửa `CONTRACT_DIR` trong test contract; `contract/README.md` ghi đường dẫn mới
- [x] 3.6 ESLint: `no-restricted-imports` chặn `@/*` trong `packages/**`

## 4. Nối UI và công cụ

- [x] 4.1 `src/components/ui/chat/index.ts` và component UI import core từ package; re-export thêm `ChatSessionStorage`
- [x] 4.2 `jest.config.js`: `roots` gồm `packages`; `check:commit` gọi thêm `typecheck` của package
- [ ] 4.3 Kiểm Metro resolve package trên iOS, Android, web; chỉ thêm `watchFolders` nếu thật sự lỗi (ghi lý do) — headless: `expo export` web/iOS/Android bundle được (đã xoá `dist/`), không cần `watchFolders` (design N1); chưa chạy trên thiết bị
- [x] 4.4 `scripts/create-product-from-kit.js`: không chép `packages/`, bỏ `workspaces`, ghi dependency version đã publish — design N7

## 5. Kiểm chứng

- [x] 5.1 Chạy lại các lệnh ở 1.1: số test pass bằng mốc cộng test mới, không sửa assertion cũ — 39 suites / 221 pass = 219 + 2 test mới; assertion cũ không đổi
- [x] 5.2 `yarn workspace @thinhnguyenvn/chat-core build`; kiểm `dist/` không còn chuỗi `@/`; `npm pack --dry-run` chỉ có `dist`, `contract`, `README.md`, `CHANGELOG.md` — 37 file: `dist/`, `contract/`, `README.md`, `CHANGELOG.md`, `LICENSE`, `package.json`
- [ ] 5.3 Lặp lại các luồng ở 1.2 trên ba nền tảng — chỉ web (mock flow trên bản export); iOS/Android trên thiết bị chưa chạy

## 6. Tài liệu MyRN

- [x] 6.1 `.docs/shared-ui-catalog.md` (mục MyChat: core ở package, `session.storage`) và `.docs/platform-kit-sync.md` (core không còn chép tay, product nâng version package)
- [x] 6.2 `CHANGELOG.md` MyRN mục Unreleased: Changed (core thành package), BREAKING `session.storage`, việc product cần làm

## 7. Sau khi Thịnh review và publish (ngoài repo này)

- [ ] 7.1 Thịnh commit MyRN và `npm publish --access public` `0.1.0` (npm public đã chốt ngày 11/10; agent không publish)
- [ ] 7.2 my-store, PR riêng qua `sync-from-myrn`: thêm dependency `0.1.0`, xoá bản sao core + `contract/` + test core, `use-chat-adapter.ts` truyền `session.storage` bọc `@/utils/storage`; chạy chat với gateway localhost
- [ ] 7.3 Gateway: sửa `AGENTS.md` và `contract/README.md` (đường dẫn bản sao mới), master plan ghi M18 xong
