## ADDED Requirements

### Requirement: Shared empty state cho list và container trống
Project MUST cung cấp facade `MyEmptyState` (token-driven) với `title` bắt buộc, `subtitle` tùy chọn, và CTA tùy chọn (`actionLabel` + `onActionPress` hoặc tương đương). Màn list/async MUST dùng shared empty state thay vì để trống không giải thích (theo `.docs/default-behavior-rules.md`).

#### Scenario: Empty list hiển thị title
- **WHEN** danh sách không có item và UI render `MyEmptyState` với `title`
- **THEN** người dùng MUST thấy title (và subtitle nếu được truyền)

#### Scenario: Empty state có CTA
- **WHEN** `MyEmptyState` có action CTA và người dùng nhấn CTA
- **THEN** callback action MUST được gọi đúng một lần cho mỗi lần nhấn

### Requirement: Shared error state có retry
Project MUST cung cấp facade `MyErrorState` với message/title rõ và hành động retry (`onRetry`). Màn fetch lỗi (không có stale data đủ để giữ) MUST có thể hiển thị error state có retry.

#### Scenario: Retry từ error state
- **WHEN** `MyErrorState` hiển thị và người dùng nhấn retry
- **THEN** `onRetry` MUST được gọi

### Requirement: Shared skeleton loading presets
Project MUST cung cấp facade `MySkeleton` bọc `react-native-reanimated-skeleton` (hoặc lib skeleton đã dùng trong repo) với ít nhất các preset dùng cho list/loading: `listRow`, `textBlock`, `card` (tên tương đương được phép nếu document). Canonical list screens MUST ưu tiên `MySkeleton` thay vì copy layout skeleton ad-hoc mới.

#### Scenario: Skeleton listRow khi loading
- **WHEN** màn list ở trạng thái loading lần đầu và render `MySkeleton` preset list row (có thể `count` > 1)
- **THEN** UI MUST hiện placeholder skeleton (không blank screen)

### Requirement: Todo list dùng shared async UI states
`todo` list (canonical) MUST dùng `MyEmptyState` / `MyErrorState` / `MySkeleton` (hoặc composition của chúng) cho empty / fetch error / initial loading — không giữ pattern inline riêng nếu đã có facade tương đương.

#### Scenario: Todo empty / error / loading
- **WHEN** todo list lần lượt ở empty, error (không data), và initial loading
- **THEN** UI MUST lần lượt dùng shared empty, error+retry, và skeleton thay vì blank hoặc copy không còn cần thiết
