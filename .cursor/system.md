# MyRN — System reference (for AI)

Tài liệu tham chiếu để check stack, cấu trúc và quy ước khi làm việc với repo.

---

## 1. Project

- **MyRN**: Expo (React Native) app, đa nền tảng (iOS, Android, Web).
- **Routing**: expo-router (file-based), React Navigation (Stack + Tabs).

---

## 2. Stack

- Expo 54, React 19, React Native 0.81, TypeScript.
- Skia: `@shopify/react-native-skia` (Canvas, shadow).
- Reanimated, Gesture Handler.
- Web: entry `index.web.tsx` + `LoadSkiaWeb`; path alias `@/*` → project root (tsconfig).

---

## 3. Cấu trúc chính

| Thư mục / file | Mô tả |
|----------------|--------|
| `app/` | Routes (Expo Router): `(tabs)/`, `modal`, `_layout.tsx`. |
| `theme/` | Design tokens: `colors`, `elevation`, `spacing`, `radius`, `typography`, `fonts`, `overlay`. |
| `components/elements/` | UI dùng theme: `my-text`, `my-surface`. |
| `components/ui/` | IconSymbol, Collapsible, v.v. |
| `hooks/` | useColorScheme, useThemeColor. |
| `constants/` | theme.ts (Colors, Fonts). |

---

## 4. Design system (theme)

- **Màu**: token dạng `role/state/variant` (vd: `text/active/primary`). Resolve bằng `getColor()` từ `theme/colors.ts`.
- **Typography**: keys `h1`–`h6`, `subtitle`, `body`, `label`, `caption`, `button`. Font Roboto (Regular, Medium, Bold). Định nghĩa trong `theme/typography.ts`, `theme/fonts.ts`.
- **Elevation**: token `soft` \| `medium` \| `hard` + direction (vd: `soft/down`). `getElevation()` trong `theme/elevation.ts`.
- **Spacing / Radius**: dùng constant từ `theme/spacing.ts`, `theme/radius.ts` (không hardcode số).

---

## 5. Component conventions

- **MyText**: props `typography`, `color` (TextColorType). Import từ `@/theme/typography`, `@/theme/colors`.
- **MySurface**: props `elevation`, `radius`, `padding`, `backgroundColor`, `style`. Style tách container vs content; shadow vẽ bằng Skia (Canvas + RoundedRect + Shadow).

---

## 6. Quy ước khi code

- Luôn dùng alias `@/*` cho import (đã cấu hình trong tsconfig).
- Màu, chữ, khoảng cách: ưu tiên token từ `theme/` thay vì hardcode.
- Component mới liên quan text/surface: ưu tiên dùng hoặc mở rộng MyText / MySurface để đồng bộ theme.
