## Context

Logic MyChat (khoảng 790 dòng, cộng mock 250 dòng) đã gần như độc lập với my-rn. Chỗ còn dính:

| File | Phụ thuộc | Xử lý |
|------|-----------|-------|
| `http-chat-adapter.ts` | `isWeb` từ `@/constants/dimensions` | `Platform.OS === 'web'` (react-native) |
| `http-chat-adapter.ts` | `storageGetItem/SetItem/RemoveItem` từ `@/utils/storage` | app truyền `session.storage` |
| `http-chat-adapter.test.ts` | mock `@/utils/storage` | test truyền storage giả |
| `chat-adapter.ts` | `ReactElement` cho `RenderCustomMessage` | type này về UI |
| `http-chat-adapter.contract.test.ts` | đọc `contract/` ở gốc repo | fixture chuyển vào package |

my-store hiện có bản sao y nguyên `src/components/ui/chat/` và `contract/` (diff 0 ngày 11/10). MyRN dùng yarn v1, root `package.json` đã `private: true`.

## Goals / Non-Goals

**Goals:** một nguồn duy nhất cho core, product cài bằng dependency có version; core chạy được trong app RN không dùng my-rn (bds-mobile-seller); hành vi MyChat trong MyRN và my-store giữ nguyên để E1 test đúng code mới.

**Non-Goals:** package UI; đổi wire contract hay API của `useConversation`; M17 `send_media`; CI tự publish; tích hợp bds-mobile-seller.

## Decisions

### D1. Package nằm trong MyRN, dùng yarn workspaces

`packages/chat-core/` trong MyRN, root thêm `"workspaces": ["packages/*"]`. App MyRN (playground) phụ thuộc package qua workspace nên luôn chạy source chưa publish. Product cài bản đã publish.

*Thay vì:* repo riêng (thêm một repo để đồng bộ, playground phải `link` tay); hoặc chỉ folder `core/` (phương án 1A, Thịnh không chọn vì M20 cần cài được ngoài my-rn).

### D2. Phát hành qua npm, scope cá nhân, public

Tên tạm `@thinhnguyenvn/chat-core`. Public nên EAS build, máy dev và CI của app khác cài không cần token. Code chỉ là client NDJSON và state chat, không có secret hay business rule.

*Thay vì:* GitHub Packages private (mọi môi trường build phải có token đọc registry, kể cả EAS và CI công ty); tarball đính GitHub Release (không có registry nhưng nâng version phải sửa URL tay). Thịnh chốt npm public ngày 11/10.

### D3. Build `tsc` ra CommonJS + `.d.ts`

`main: dist/index.js`, `types: dist/index.d.ts`, `files: ["dist", "contract", "CHANGELOG.md", "README.md"]`, `prepublishOnly` chạy build. CommonJS để Metro (native và web) và Jest của product dùng thẳng, không phải thêm `transformIgnorePatterns`. Target ES2020; JSX không có trong core nên không cần Babel.

*Thay vì:* ship TS source (`main: src/index.ts`): Metro chịu được nhưng Jest của từng product phải transform `node_modules`, dễ vỡ khác nhau ở mỗi app.

### D4. Ranh giới package do tsconfig riêng giữ

`packages/chat-core/tsconfig.json` không có `paths` (`@/…` không tồn tại), nên `tsc` lỗi ngay khi core import gì của my-rn. `package.json` của package chỉ có peer `react` và `react-native`; ESLint `no-restricted-imports` chặn `@/*` trong `packages/**` để báo lỗi ngay trong editor.

### D5. Storage nằm trong `session`

```ts
export interface ChatSessionStorage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}
export interface ChatSessionScope { appId: string; userId: string; storage: ChatSessionStorage }
```

`storage` bắt buộc khi có `session`, nên quên truyền là lỗi lúc compile chứ không phải mất session lúc chạy. Key giữ nguyên `chat.session.<app>.<user>` để id session đã lưu trên máy user vẫn đọc được sau khi nâng cấp. my-store truyền object bọc `@/utils/storage` (SecureStore trên native, `localStorage` trên web) như hôm nay.

*Thay vì:* package tự import `expo-secure-store` (kéo dependency Expo vào core, bds-mobile-seller có thể không dùng Expo); hoặc mặc định bộ nhớ RAM khi không truyền (mất session khi mở lại app mà không ai biết).

### D6. UI giữ đường import cũ

`src/components/ui/chat/index.ts` re-export mọi thứ core đang export hôm nay (`useConversation`, `createHttpChatAdapter`, `MockChatAdapter`, `generateMessageId`, types) cộng `ChatSessionStorage`. Component UI import từ package. `RenderCustomMessage` chuyển vào file type của UI. Kết quả: màn chat của my-store và playground không sửa import.

### D7. Fixture contract nằm trong package

`contract/` ở gốc MyRN chuyển vào `packages/chat-core/contract/` (giữ `README.md` ghi commit nguồn gateway). Product không giữ bản sao nữa; test contract chạy trong MyRN. Gateway sửa câu hướng dẫn "MyRN copies `contract/`" thành đường dẫn mới.

### D8. Version

`0.1.0` cho bản đầu. `0.x` tới khi platform gắn `platform-v1.0.0` sau E1 thì lên `1.0.0`. Từ `1.0.0`: thêm event/option không phá = minor, đổi API phá = major. Wire contract version (`X-Chat-Contract`) độc lập với version package; README package ghi bảng "package version → contract version hỗ trợ".

### D9. Test chạy từ Jest gốc của MyRN

`jest.config.js` thêm `roots: ['<rootDir>/src', '<rootDir>/packages']`; test core dùng cùng preset. Package không có Jest riêng (tránh hai cấu hình). Package có script `build` và `typecheck`; `check:commit` của MyRN gọi thêm `typecheck` của package.

## Risks / Trade-offs

- **Metro resolve symlink workspace** → Expo SDK 57 tự cấu hình monorepo; kiểm `yarn start` trên iOS, Android, web với playground chat. Nếu lỗi, thêm `watchFolders` tối thiểu trong `metro.config.js`.
- **Product mới clone MyRN mang theo `packages/`** → `create-product-from-kit` bỏ `packages/` và field `workspaces`, ghi dependency version đã publish.
- **Publish là việc không đảo ngược** (version đã publish không ghi đè) → Thịnh publish tay sau khi review; agent không chạy `npm publish`.
- **EAS build my-store cần version đã publish** → E1 chạy localhost nên không chặn; ghi trong tasks.
- **Repo công ty dùng package cá nhân** → hỏi công ty trước M20; không chặn change này.
- **Hai bản sao trong lúc chuyển** → my-store chuyển sang package trong PR riêng ngay sau khi publish; trong lúc chờ bản sao cũ vẫn chạy được (API không đổi ngoài `session.storage`).

## Migration Plan

1. MyRN: tạo package, chuyển file, chạy toàn bộ test/typecheck/lint, chạy playground ba nền tảng.
2. Thịnh review, commit MyRN, `npm publish` `0.1.0`.
3. my-store (PR riêng qua `sync-from-myrn`): thêm dependency, xoá bản sao core + `contract/` + test core, sửa `use-chat-adapter.ts`, chạy app với gateway localhost.
4. Gateway: sửa câu hướng dẫn contract, master plan ghi M18 xong.

Rollback: product ghim về bản sao cũ bằng git revert PR my-store; package không cần gỡ.

## Open Questions

- Không còn. Kênh phát hành đã chốt: npm public, scope `@thinhnguyenvn` (D2).

## Implementation notes (2026-10-11)

Điều chỉnh nhỏ so với các quyết định ở trên, phát hiện lúc làm:

- **N1. MyRN resolve package về source, không qua `dist/` (bổ sung D1/D3).** `main` trỏ `dist/`, nên nếu chỉ dựa vào symlink workspace thì `tsc`, Jest và Metro của MyRN đều cần build trước và playground chạy bản build chứ không phải source. Thêm ba ánh xạ tên package → `packages/chat-core/src`: `tsconfig.json` `paths`, `jest.config.js` `moduleNameMapper`, và `metro.config.js` `resolveRequest` (đã có sẵn hook cho shim linear-gradient). Jest và Metro chỉ ánh xạ khi `packages/` tồn tại, nên product tạo bằng `create-product` dùng bản publish mà không phải sửa config. Không cần `watchFolders`: `packages/` nằm trong project root. Đã kiểm: `expo export` web, iOS, Android đều bundle được khi đã xoá `dist/`.
- **N2. `isWeb` nằm trong `src/platform.ts` của package** (`Platform.OS === 'web'`), để test mock `./platform` thay cho mock `@/constants/dimensions` như trước.
- **N3. TypeScript 6 báo `moduleResolution: node` deprecated**, nên tsconfig package dùng `module`/`moduleResolution: Node16`. Package không có `"type": "module"` nên output vẫn là CommonJS (D3 giữ nguyên).
- **N4. Export của package rộng hơn index UI một chút:** thêm `conversationReducer`, `initialConversationState`, `ConversationState`, `ConversationAction`, `CardLockState`, `CARD_LOCK_STATES`, `ChatSessionScope`. Component UI cần `CardLockState`; spec có kịch bản product import `conversationReducer`. Index UI (D6) re-export đúng như trước cộng `ChatSessionStorage`.
- **N5. `yarn lint`/`yarn fix` chạy `eslint src packages`** để rule `no-restricted-imports` (D4) chạy trong `check:commit`, không chỉ trong editor.
- **N6. `jest.config.js` `roots`** (D9) cũng làm Jest thôi quét bản sao repo trong `.claude/worktrees/` (trước đó các bản sao này làm `yarn test` fail 11 test không liên quan).
- **N7. `create-product-from-kit` chạy ngay trên bản clone của product**, nên "không chép `packages/`" làm thành: hỏi xác nhận, xoá `packages/`, bỏ `workspaces`, ghim dependency bằng version trong `package.json` của package, bỏ `typecheck` package khỏi `check:commit`, trả `lint`/`fix` về `eslint src`, bỏ `paths` của package trong `tsconfig.json`.
- **N8. License MIT** (Thịnh chọn ngày 11/10): `package.json` có `"license": "MIT"`, kèm file `LICENSE`.
