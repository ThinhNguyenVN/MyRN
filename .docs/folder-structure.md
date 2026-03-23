app/
 ├ (auth)/
 │   ├ login.tsx
 │   ├ register.tsx
 │
 ├ (main)/
 │   ├ index.tsx
 │   ├ list.tsx
 │
 ├ _layout.tsx

features/
 ├ auth/
 │   ├ screens/
 │   │   ├ LoginScreen/
 │   │   │   └ index.tsx
 │   │   └ RegisterScreen/
 │   │       └ index.tsx
 │   │
 │   ├ components/
 │   ├ hooks/
 │   ├ authSlice.ts
 │   ├ authApi.ts
 │
 ├ list/
 │   ├ screens/
 │   │   ├ ListScreen/
 │   │   └ DetailScreen/
 │   │
 │   ├ listSlice.ts
 │   └ listApi.ts

components/
hooks/
store/
services/
