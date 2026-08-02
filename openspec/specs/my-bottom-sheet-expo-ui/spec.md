## ADDED Requirements

### Requirement: MyBottomSheet present được trên native
`MyBottomSheet` trên iOS/Android (mobile width) MUST mở được nội dung sheet khi gọi `open()` / `present()` tương đương; MUST đóng được qua `close()` / dismiss / pan-down khi `pressBackdropToClose` hoặc `enablePanDownToClose` bật. Engine MUST là `@expo/ui` (community bottom-sheet hoặc Universal BottomSheet đã chọn trong design), không phụ thuộc `@gorhom/bottom-sheet` sau khi migration hoàn tất.

#### Scenario: Mở sheet từ playground trên native
- **WHEN** người dùng bấm demo mở sheet trên iOS hoặc Android Expo Go / dev client
- **THEN** sheet MUST hiện nội dung (không silent no-op như gorhom #16)

#### Scenario: Đóng sheet
- **WHEN** người dùng gọi `close()` hoặc dismiss theo cấu hình cho phép
- **THEN** sheet MUST đóng và `onClosed` / tương đương MUST được gọi khi facade cam kết callback đó

### Requirement: Facade API ổn định cho consumers chính
Call sites hiện có (playground bottom-sheet, dropdown sheet, date-picker shell, wheel-picker sheet) MUST tiếp tục mở/đóng sheet qua `MyBottomSheet` ref mà không import gorhom. Các prop không còn hỗ trợ (custom `BottomSheetFooter` / backdrop / handle gorhom) MUST được thay bằng pattern facade đã document (children / slot) — **BREAKING** chỉ trong implementation nội bộ, call sites MUST được cập nhật trong cùng change.

#### Scenario: Dropdown vẫn mở list trong sheet trên mobile
- **WHEN** mở `MyDropdownInput` trên mobile size
- **THEN** danh sách lựa chọn MUST hiện trong sheet và chọn được item

#### Scenario: Date / wheel picker shell vẫn mở được
- **WHEN** mở date picker hoặc wheel picker trên mobile
- **THEN** sheet/engine MUST hiện nội dung picker (không crash, không no-op)

### Requirement: Gỡ @gorhom/bottom-sheet khỏi dependencies
Sau khi regression pass, `package.json` MUST NOT còn direct dependency `@gorhom/bottom-sheet`. Không còn import `@gorhom/bottom-sheet` trong `src/`.

#### Scenario: package.json sạch gorhom bottom-sheet
- **WHEN** đọc `dependencies` trong `package.json` và grep `from '@gorhom/bottom-sheet'` trong `src/`
- **THEN** không còn dependency và không còn import đó

### Requirement: Web hoặc desktop-width vẫn dùng được sheet/popup
Trên web (hoặc nhánh non-mobile mà facade giữ lại), người dùng MUST vẫn mở được nội dung tương đương sheet (Expo UI web path hoặc Modal branded — theo quyết định spike đã chốt trong implementation), không regress hoàn toàn so với trạng thái “web work” trước migration.

#### Scenario: Playground bottom sheet trên web
- **WHEN** mở demo bottom sheet trên web
- **THEN** nội dung MUST hiện dưới dạng sheet/drawer/modal theo path đã chọn và đóng được
