app/
 ├ (public)/          # Không bắt buộc đăng nhập: tabs (home, playground), login, home
 │   ├ (tabs)/
 │   ├ login.tsx
 │   └ home.tsx
 ├ (private)/         # Cần đăng nhập (todo, …)
 ├ _layout.tsx

features/
 ├ auth/
 │   ├ screens/
 │   ├ components/
 │   ├ hooks/
 │   ├ auth-slice.ts
 │   └ auth-api.ts

components/
hooks/
store/
services/
