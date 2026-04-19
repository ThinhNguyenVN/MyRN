# `my-rn`

Expo SDK 55 React Native starter kit for iOS, Android, and Web.

`my-rn` is the reference implementation behind `create-myrn-app`. It is designed to be copied and followed closely by future projects, especially for:

- Expo Router shell structure
- feature-first module organization
- shared UI kit composition
- theme and token usage
- API integration with Axios + RTK Query
- app state with Redux Toolkit

## Starter-kit documentation

The conventions for future projects live in `.docs/`:

- `.docs/README.md`: map of all starter-kit docs
- `.docs/folder-structure.md`: route shell and feature folder rules
- `.docs/screen-standard.md`: standard screen structure
- `.docs/ui-theme-standard.md`: UI kit, theme, token, and styling rules
- `.docs/data-state-standard.md`: Axios, RTK Query, Redux Toolkit, and hook rules
- `.docs/canonical-references.md`: which parts of the repo are the source of truth

When there is ambiguity, follow `src/features/auth` and `src/features/todo` first.

## Branch naming

Use branch names in this format:

- `feat/<description>`
- `fix/<description>`
- `issue/<description>`
- `release/<description>`

Rules:

- Do not create or use `cursor/` branches for normal development work.
- Prefer the existing helper script to generate a valid branch name.

Examples:

- `feat/auth-login`
- `fix/token-refresh`
- `issue/123-login-error`
- `release/1-2-0`

Generate a valid branch name from the CLI if needed:

```bash
yarn branch:create feat auth login
yarn branch:create fix token refresh
yarn branch:create issue 123 login error
yarn branch:create release 1 2 0
```

## Install

```bash
yarn install
```

Notes:

- `yarn install` runs a `postinstall` step that copies `canvaskit.wasm` into `public/`.
- `mkdir public` may warn if the directory already exists. That warning is harmless.

## Run the app

Start Metro:

```bash
yarn start
```

For web in Cursor Cloud or other scripted environments:

```bash
npx dotenv -e .env.test -- npx expo start --web --port 8081
```

Notes:

- This repo uses `.env.test`, `.env.staging`, and `.env.production`.
- Only `EXPO_PUBLIC_*` values are available in app runtime.
- The current Expo CLI does not support `--non-interactive`; use `CI=1` if needed.

## Lint and test

Lint:

```bash
yarn lint
```

Tests:

```bash
npx dotenv -e .env.test -- yarn test
```

Important:

- Do not run `yarn test` without env vars.
- `axios-instance.test.ts` depends on `EXPO_PUBLIC_API_BASE_URL` being set via `.env.test`.

## Development references

- `src/features/auth`: canonical auth flow reference
- `src/features/todo`: canonical CRUD and form reference
- `src/app/(public)/(tabs)/playground`: component usage catalog only, not a production structure reference

## Runtime notes

- Backend is the public DummyJSON API at `https://dummyjson.com`.
- Demo credentials: `emilys` / `emilyspass`.
- Expo Router may warn about files under `playground/` missing default exports; those warnings are expected for some colocated utility files.
