## ADDED Requirements

### Requirement: Core MyChat là package độc lập với my-rn
Logic MyChat (types `ChatMessage`/`ConversationEvent`…, `conversationReducer`, `useConversation`, `ChatAdapter`, `createHttpChatAdapter`, `MockChatAdapter`, `generateMessageId`) SHALL nằm trong package `packages/chat-core/`. Code trong package MUST NOT import đường dẫn `@/…`, theme, element `My*` hay util nào của my-rn. Dependency của package MUST chỉ là peer `react` và `react-native`.

#### Scenario: Core lỡ import util của my-rn
- **WHEN** một file trong `packages/chat-core/src/` thêm `import … from '@/utils/storage'`
- **THEN** `typecheck` của package MUST thất bại và ESLint MUST báo lỗi `no-restricted-imports`

#### Scenario: App không dùng my-rn cài package
- **WHEN** một app React Native không có alias `@/` cài package và gọi `createHttpChatAdapter` cùng `useConversation`
- **THEN** app MUST build và chạy được mà không cần thêm file hay alias nào của my-rn

### Requirement: Package phát hành bản build có type
Package SHALL build bằng `tsc` ra `dist/` dạng CommonJS kèm `.d.ts`, `main` và `types` trỏ vào `dist/`. Bản phát hành MUST gồm `dist/`, `contract/`, `README.md`, `CHANGELOG.md`. Product dùng package MUST NOT cần đổi `transformIgnorePatterns` của Jest hay cấu hình Babel.

#### Scenario: Product chạy test với package
- **WHEN** product cài package và test của product import `conversationReducer`
- **THEN** Jest của product MUST chạy được với cấu hình hiện có

### Requirement: UI MyChat giữ đường import cũ
`src/components/ui/chat/index.ts` SHALL re-export toàn bộ API core đã export trước change này, cùng type `ChatSessionStorage`. Component UI MUST lấy core từ package, không giữ bản sao file core. Type `RenderCustomMessage` MUST nằm ở UI, không ở package.

#### Scenario: Màn chat của product không đổi import
- **WHEN** một màn import `{ MyChat, useConversation, createHttpChatAdapter, ChatMessage } from '@/components/ui/chat'`
- **THEN** import MUST resolve được mà không sửa màn đó

### Requirement: Version package tách khỏi version contract
Package SHALL theo semver: `0.x` cho tới khi platform gắn `platform-v1.0.0`, sau đó `1.0.0`; từ `1.0.0` thay đổi phá API MUST tăng major. Package MUST có `CHANGELOG.md` và README ghi bảng version package → contract version (`X-Chat-Contract`) được hỗ trợ.

#### Scenario: Thêm event mới không phá
- **WHEN** package `1.x` thêm xử lý một event mới mà client cũ bỏ qua được
- **THEN** version MUST tăng minor và `CHANGELOG.md` MUST có mục cho thay đổi đó

### Requirement: Product mới không mang theo source package
`create-product-from-kit` SHALL không chép `packages/` và field `workspaces` sang product mới; product mới MUST phụ thuộc bản package đã phát hành.

#### Scenario: Tạo product từ kit
- **WHEN** chạy `yarn create-product` tạo product mới
- **THEN** product MUST NOT có thư mục `packages/chat-core/` và `package.json` của product MUST có dependency package với version cụ thể
