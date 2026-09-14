# my-rn

**A platform template for building universal React Native + Expo apps — one codebase ships iOS, Android, and Web, and one command turns it into a new product.**

Built on Expo SDK 57, React Native 0.86, React 19, and TypeScript. `my-rn` isn't a sample app you delete and rewrite — it's the paved road every product forks from and stays in sync with.

## What makes this different

**One command to a real product.**
```bash
npx create-myrn-app my-garden
```
Clones this platform, strips the template's git history, renames the app identity (`appName` / `slug` / `appId` → iOS bundle identifier + Android package), installs dependencies, and drops you into a working iOS + Android + Web app — not an empty shell. Accepts `--app-id`, `--app-name`, `--slug` to override any of those individually. CLI: [`ThinhNguyenVN/create-myrn-app`](https://github.com/ThinhNguyenVN/create-myrn-app).

Note: the CLI renames the app identity, not EAS project linking (`eas.json` channels / EAS project ID) — verify that by hand before your first build/submit for a new product, so it doesn't push to the template's own EAS project.

**Universal by default, not by accident.**
Expo Router + React Native Web power the whole app — navigation, theming, forms, data fetching, and the shared UI kit all run identically on native and web. Features are written once under `src/features` and ship to three platforms without a platform-specific rewrite.

**Built for an AI agent to pick up cold.**
`.docs/` is a machine-readable contract, not prose documentation. A fresh AI session with zero prior context reads `product-kickoff.md`, asks for the handful of inputs it can't invent (product goal, scope, design source, API, whether to replace the starter screens), and then implements against canonical reference features (`auth`, `todo`) instead of guessing at architecture. Scope is tracked in versioned spec files (`specs/*.spec.md`) and OpenSpec changes, so requirements and decisions survive across sessions instead of living only in chat history.

**A real production UI kit, not a component demo.**
Themed `My*` components, design tokens with a single rebrand override point (`brand.config.ts`), a lint rule that blocks hardcoded colors, and a `playground` route that catalogs every component live on-device — so "what should I use for this" always has one answer.

**Stays in sync instead of drifting.**
Every product forked from `my-rn` can pull platform updates back in later, and reusable pieces built while shipping a product can be backported to the platform — a documented two-way sync (`.docs/platform-kit-sync.md`), not a one-time copy-paste that quietly rots.

## Quickstart

```bash
npx create-myrn-app my-garden
cd my-garden
yarn start
```

Dependencies are already installed by the CLI. Already cloned manually instead of via the CLI? Run `yarn create-product` to rename the app identity in place, then `yarn install`.

## Architecture at a glance

- `src/app` — Expo Router route shell only; thin, no business logic.
- `src/features` — where product code actually lives, one folder per feature (`container + view + styles`).
- `src/features/auth` and `src/features/todo` — canonical structure references; copy their shape for new features instead of inventing a pattern.
- Shared UI kit, theme tokens, RTK Query + Redux Toolkit data layer, i18n — all reusable across features and platforms.
- `src/app/(public)/(tabs)/playground` — component catalog for development only, never production structure.

Full conventions and precedence rules: `.docs/README.md`. Starting a real product: `.docs/product-kickoff.md`.

## Install

```bash
yarn install
```

## Run the app

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

## Quality checks

```bash
yarn check:types      # tsc --noEmit
yarn lint              # ESLint
yarn lint:tokens       # blocks hardcoded colors outside the theme system
yarn check:boundaries  # enforces src/app vs src/features architecture rules
npx dotenv -e .env.test -- yarn test
```

`yarn check:commit` runs all of the above except `check:boundaries` in one pass.

Important: do not run `yarn test` without env vars — `axios-instance.test.ts` depends on `EXPO_PUBLIC_API_BASE_URL` from `.env.test`.

## Development references

- `src/features/auth`: canonical auth flow reference.
- `src/features/todo`: canonical CRUD and form reference — always calls the public DummyJSON API (`https://dummyjson.com`, demo login `emilys` / `emilyspass`), independent of a product's real `API_BASE_URL`.
- `src/app/(public)/(tabs)/playground`: component usage catalog only, not a production structure reference. Expo Router may warn about a few colocated utility files under `playground/` missing default exports — expected, not a bug.

## Branch naming

Follow `AGENTS.md` as the canonical source for branch naming rules and examples.

## Project documentation

The working conventions for this codebase live in `.docs/`:

- `.docs/README.md` — map of all project docs and reading order by task.
- `.docs/product-kickoff.md` — start here when turning this template into a real product.
- `.docs/folder-structure.md` — route shell and feature folder rules.
- `.docs/screen-standard.md` — standard screen structure.
- `.docs/ui-theme-standard.md` — UI kit, theme, token, and styling rules.
- `.docs/data-state-standard.md` — Axios, RTK Query, Redux Toolkit, and hook rules.
- `.docs/canonical-references.md` — which parts of the repo are the source of truth.
- `.docs/platform-kit-sync.md` — how platform and product stay in sync over time.

When there is ambiguity, follow the unified precedence in `.docs/README.md` first. Use `.docs/default-behavior-rules.md` as the fallback layer in that precedence.
