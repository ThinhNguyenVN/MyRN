## ADDED Requirements

### Requirement: MySearchInput preset trên MyTextInput
Project MUST cung cấp `MySearchInput` compose `MyTextInput` với mặc định phù hợp search: icon search, `returnKeyType="search"` (hoặc tương đương cross-platform), và nút clear khi có giá trị khác rỗng. Props còn lại MUST forward được tới `MyTextInput` trừ các default đã chốt.

#### Scenario: Clear xóa text
- **WHEN** `MySearchInput` có value không rỗng và người dùng nhấn clear
- **THEN** value MUST được xóa (callback change nhận chuỗi rỗng hoặc tương đương)

#### Scenario: Search defaults
- **WHEN** render `MySearchInput` không override icon/returnKey
- **THEN** UI MUST có affordance search (icon) và hành vi bàn phím search theo default đã chốt

### Requirement: Playground demo MySearchInput
Playground MUST có entry demo `MySearchInput` (route riêng hoặc section rõ) để smoke.

#### Scenario: Playground search tương tác
- **WHEN** mở playground search demo, nhập text, nhấn clear
- **THEN** text MUST biến mất và không crash
