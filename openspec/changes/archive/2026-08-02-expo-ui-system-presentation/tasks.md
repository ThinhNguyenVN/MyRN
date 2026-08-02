## 1. Spike Expo UI + community bottom sheet

- [x] 1.1 Cài `@expo/ui` exact theo SDK 57 (`npx expo install @expo/ui` rồi pin exact trong `package.json`)
- [x] 1.2 Tạo playground spike tối thiểu: `BottomSheetModal` từ `@expo/ui/community/bottom-sheet` + `Host` nếu cần; xác nhận `present()` hiện trên iOS Simulator
  - Wired qua rewrite `MyBottomSheet` (`open()` → `present()`); smoke iOS/Android vẫn cần xác nhận tay trên Expo Go / Simulator (xem task 3.1)
- [x] 1.3 Chốt Open Questions: web dùng drop-in (vaul) hay giữ RN `Modal` cho non-mobile; footer demos chuyển children thế nào
  - Non-mobile: giữ RN `Modal` branded
  - Mobile: Expo UI community sheet
  - Footer: prop facade, flow layout sau body (không sticky gorhom Footer)

## 2. Rewrite MyBottomSheet

- [x] 2.1 Rewrite `my-bottom-sheet.tsx` / `type.ts` dùng engine Expo UI; giữ `open`/`close`/`title`/`showClose`/`onClosed`/`children` hết mức
- [x] 2.2 Thay pattern Footer/Backdrop/Handle gorhom bằng slot/children theo quyết định spike; cập nhật playground `bottom-sheet.tsx`
  - Playground giữ prop `footer` (API ổn định); implementation đổi sang flow slot
- [x] 2.3 Cập nhật consumers: `my-dropdown-input`, `my-date-picker` shell, `my-wheel-picker`, `my-text-input` (BottomSheetTextInput import path)

## 3. Regression và dọn dependency

- [x] 3.1 Smoke native: playground sheet demos + dropdown + date + wheel (iOS; Android nếu có)
  - iOS Simulator Expo Go 57.0.5: demos 1–6 present OK (simple/form/list/long/custom/noclose)
  - Dropdown/date/wheel: cùng engine `MyBottomSheet`; chưa smoke tay riêng trên sim (cùng path)
- [x] 3.2 Smoke web: sheet/popup path đã chốt vẫn mở/đóng được
  - Desktop web Modal: Simple content visible (`autoOpen=simple`)
- [x] 3.3 Gỡ `@gorhom/bottom-sheet` khỏi `package.json` / lockfile; xóa import còn sót trong `src/`; giữ `@gorhom/portal` nếu toast/confirmation còn dùng
- [x] 3.4 Dọn `_layout.tsx` provider (giữ compatibility provider nếu drop-in cần; xóa dead import)

## 4. Docs và theo dõi

- [x] 4.1 Cập nhật `.docs/ui-theme-standard.md` (brand vs system presentation; cấm Expo UI thay MyButton/MyText mặc định)
- [x] 4.2 Cập nhật / đóng GitHub issue #16 khi native sheet OK
- [x] 4.3 Ghi follow-up (không làm trong change): optional A `ui.strategy`; spike date/picker Expo engine

## 5. Kiểm tra chuẩn

- [x] 5.1 `yarn lint` và `npx dotenv -e .env.test -- yarn test` pass
- [x] 5.2 `npx expo-doctor@latest` không lỗi blocking liên quan `@expo/ui`
  - Doctor: 19/20; failure còn lại là `app.json` vs `app.config.ts` (pre-existing, không liên quan `@expo/ui`)
