## 1. Spike Expo UI date + wheel

- [x] 1.1 Tạo playground spike tối thiểu: community `DateTimePicker` (`@expo/ui/community/datetime-picker`) trên iOS; ghi nhận web no-op
  - Spike xong; **không promote** — single + range giữ branded calendar (month/year đồng bộ)
- [x] 1.2 Spike community/universal `Picker` (wheel trên iOS; hành vi Android/web); so sánh với `WheelPickerView` hiện tại
  - iOS: `ExpoWheelPickerField`; Android/web giữ `WheelPickerView`
- [x] 1.3 Chốt Open Questions trong `design.md`: Android wheel custom vs menu; range/year-month defer hay không; iOS date display mặc định
  - Date: branded calendar all platforms; Wheel: Expo UI iOS only

## 2. Unit tests (logic thuần)

- [x] 2.1 Tách/viết helpers testable nếu cần (format/parse date dùng trong facade, commit value sau Confirm wheel, hoặc `resolvePickerEngine(platform)` nếu tách được)
- [x] 2.2 Thêm `*.test.ts(x)` cho helpers trên; cover happy path + edge (empty value, bounds, string-tag SwiftUI)
- [x] 2.3 `npx dotenv -e .env.test -- yarn test` pass local (và CI Node 22)

## 3. Promote facade (theo quyết định spike)

- [x] 3.1 Promote engine vào `MyWheelPicker` theo quyết định platform; giữ API + form adapter; features không import `@expo/ui`
- [x] 3.2 `MyDatePicker` (single) dùng branded calendar giống range (không Expo UI DateTimePicker)
- [x] 3.3 Cập nhật playground date/wheel demos phản ánh UX mới (không thêm helper deep-link lâu dài)
- [x] 3.4 Xác nhận `MyDateRangePicker` / year-month: giữ custom — cập nhật docs/tasks cho khớp Open Question đã chốt

## 4. Simulator smoke + cleanup

- [x] 4.1 Smoke iOS Simulator/Expo Go: playground Date Picker — mở, chọn ngày, đóng (user verify + chỉnh padding/UX)
- [x] 4.2 Smoke iOS: playground Wheel Picker — mở, chọn/confirm, đóng (user verify; fix string-tag commit)
- [x] 4.3 (Optional) Smoke Android — skipped (không có thiết bị trong session)
- [x] 4.4 Smoke web desktop: date + wheel path; dark-mode contrast (user verify)
- [x] 4.5 **Xóa mọi smoke helper tạm** trong `src/` — grep sạch `autoOpen`

## 5. Docs và kiểm tra chuẩn

- [x] 5.1 Cập nhật `.docs/ui-theme-standard.md` (date custom + wheel iOS Expo UI)
- [x] 5.2 `yarn lint` + `npx dotenv -e .env.test -- yarn test` pass
- [x] 5.3 `npx expo-doctor@latest` — không lỗi blocking liên quan `@expo/ui` / picker (pre-existing app.json vs app.config.ts)
- [x] 5.4 Sync OpenSpec delta → main specs + archive change
- [x] 5.5 Cleanup dead Expo date path: gỡ `resolveDatePickerEngine`; rename main capability → `branded-date-picker`; re-sync archive deltas
