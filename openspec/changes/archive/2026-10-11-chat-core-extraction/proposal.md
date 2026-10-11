## Why

Phần logic của MyChat (types, reducer, hook `useConversation`, `ChatAdapter`, adapter HTTP NDJSON, adapter mock) đang nằm chung folder với UI trong `src/components/ui/chat/` và được **chép tay** sang từng product (my-store đang có bản sao y nguyên, kèm bản sao thứ hai của `contract/`). Hiện có ba nơi giữ cùng một đoạn code và cùng bộ fixture: gateway → MyRN → my-store. Sắp tới thêm hai nơi nữa:

- **M17 `chat-contract-media`** (ngay sau change này) đổi event gửi ảnh thành `send_media` trong types, reducer và adapter. Nếu core vẫn chép tay thì mỗi lần đổi contract phải sync code ở mọi product.
- **M20 `bds-mobile-chat`**: app bds-mobile-seller không dùng my-rn (không có `@/theme`, `@/utils/storage`, element `My*`), nên không chép nguyên folder được.

Khảo sát code hiện tại cho thấy core đã gần như độc lập: chỉ `http-chat-adapter.ts` còn import `isWeb` (`@/constants/dimensions`) và `@/utils/storage` (lưu chat session id của M26); `chat-adapter.ts` có thêm type `RenderCustomMessage` thuộc về UI.

Đây là M18 trong `my-agent-platform/docs/master-plan.md`. Thịnh chốt ngày 11/10 (thread "propose M18"): tách thành **package riêng** (không chỉ folder), change đặt ở MyRN, ghi chú tracking ở master plan của platform.

## What Changes

- **Package mới `packages/chat-core/`** trong MyRN (yarn workspace), tên npm `@thinhnguyenvn/chat-core`, phát hành public trên npm (Thịnh chốt 11/10). Chứa: `types`, `conversation-reducer`, `use-conversation`, `chat-adapter`, `http-chat-adapter`, `mock-chat-adapter`, `generate-message-id`, test của chúng và bản sao `contract/` của gateway. Build bằng `tsc` ra `dist/` (CommonJS + `.d.ts`). Peer dependency: `react`, `react-native`. Không phụ thuộc gì của my-rn.
- **Bỏ import my-rn khỏi core.** `isWeb` thay bằng `Platform.OS === 'web'` của react-native. Storage cho chat session id do app truyền vào: `session` đổi thành `{ appId, userId, storage }` với `storage: { getItem, setItem, removeItem }` (bất đồng bộ). **BREAKING (nhỏ):** product nào truyền `session` phải thêm `storage` (my-store: 1 chỗ trong `use-chat-adapter.ts`, truyền lại đúng `@/utils/storage` đang dùng).
- **`RenderCustomMessage` ở lại UI** (`my-chat.tsx` hoặc file type của UI), không vào package.
- **UI không đổi chỗ.** `src/components/ui/chat/` giữ các component `MyChat*`, import core từ package; `index.ts` re-export toàn bộ API core như hôm nay, nên mọi chỗ `import … from '@/components/ui/chat'` trong app không phải sửa.
- **Hành vi giữ nguyên.** Không đổi wire contract, không đổi public API ngoài `session.storage`. Test reducer/adapter/contract/mock hiện có chuyển sang package và phải xanh không sửa assertion.
- **Version.** `0.x` cho tới khi platform gắn `platform-v1.0.0` (sau E1), lúc đó lên `1.0.0`. Package có `CHANGELOG.md` riêng; README ghi contract version nào được hỗ trợ.
- **Product kickoff.** `create-product-from-kit` không chép `packages/` sang product mới; product dùng bản đã publish.

Không làm trong change này: tách UI thành package, event `send_media` (M17), tích hợp vào bds-mobile-seller (M20), tự động publish bằng CI.

## Capabilities

### New Capabilities

- `mychat-chat-core`: ranh giới package (không import my-rn), danh sách API công khai, cách build và phát hành, version, nơi giữ fixture contract.

### Modified Capabilities

- `mychat-chat-adapter`: chat session id lưu qua `storage` app truyền vào; bản sao fixture contract chuyển vào package.

## Impact

- **Code MyRN:** `package.json` (workspaces), `packages/chat-core/**` (mới), `src/components/ui/chat/` (bỏ các file core, `index.ts` re-export từ package), `jest.config.js` (roots), `tsconfig.json` nếu cần, `scripts/create-product-from-kit.js`, `contract/` ở gốc chuyển vào package, `.docs/shared-ui-catalog.md`, `.docs/platform-kit-sync.md`, `CHANGELOG.md`.
- **my-store (PR riêng, Thịnh commit):** thêm dependency package, xoá bản sao core + `contract/` + test core, sửa `use-chat-adapter.ts` truyền `session.storage`. Màn chat không đổi.
- **Gateway:** `AGENTS.md` và `contract/README.md` đổi câu "MyRN copies `contract/`" thành đường dẫn mới trong package; master plan ghi M18 xong.
- **Việc bên ngoài cần Thịnh làm:** chạy `npm publish --access public` lần đầu (không đảo ngược được: version đã publish không ghi đè được).
- **Rủi ro:** (1) Metro/Jest của MyRN phải resolve được package qua symlink workspace (Expo SDK 57 tự nhận monorepo, cần kiểm trên iOS, Android và web); (2) EAS build của my-store chỉ chạy được khi version đã publish; (3) bds-mobile-seller là repo công ty, dùng package public của cá nhân cần hỏi công ty trước M20.
