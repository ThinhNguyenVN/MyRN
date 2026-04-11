# AGENTS.md

## Cursor Cloud specific instructions

This is an **Expo SDK 55 React Native** app (`myrn`) targeting iOS, Android, and Web. It uses the **DummyJSON** public API (`https://dummyjson.com`) as its backend — there is no self-hosted backend or database.

### Git branch naming

- Use branch names in the format `feat/<description>`, `fix/<description>`, or `issue/<description>`.
- Do not create or use `cursor/` branches for normal development work.
- If you need a helper, run `yarn branch:create <feat|fix|issue> <description words>` and use the printed branch name with `git checkout -b`.

### Key commands

| Action | Command |
|--------|---------|
| Install deps | `yarn install` |
| Lint | `yarn lint` |
| Tests | `npx dotenv -e .env.test -- yarn test` |
| Start (web) | `yarn start` then press `w`, or `npx dotenv -e .env.test -- npx expo start --web --port 8081` |

### Non-obvious caveats

- **Tests require env vars:** Running `yarn test` without env vars will fail the `axios-instance.test.ts` suite because `EXPO_PUBLIC_API_BASE_URL` is unset. Use `npx dotenv -e .env.test -- yarn test` to load `.env.test` before running Jest.
- **`--non-interactive` flag is not supported** by the current Expo CLI. Use `CI=1` environment variable instead if you need non-interactive mode.
- **postinstall script:** `yarn install` runs a postinstall step that copies `canvaskit.wasm` into `public/`. The `mkdir public` may warn if the directory already exists — this is harmless.
- **DummyJSON test credentials:** `emilys` / `emilyspass` (user Emily Johnson). These are public demo credentials from dummyjson.com.
- **Expo Router warnings:** Several files under `playground/` emit "missing default export" warnings during web bundling. These are utility/style files co-located with route files and do not affect functionality.
