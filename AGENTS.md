# AGENTS.md

## Agent instructions

This is an **Expo SDK 57 React Native** template app (`myrn`) for iOS, Android, and Web. Default demo backend is **DummyJSON** (`https://dummyjson.com`) — no self-hosted DB in-repo. Treat the repo as a **ready platform** for product work; see `.docs/product-kickoff.md`.

### Git branch naming

- Use `feat/`, `fix/`, `issue/`, or `release/` prefixes.
- Do not use `cursor/` branches for normal work.
- Helper: `yarn branch:create <feat|fix|issue|release> <description words>` then `git checkout -b` with the printed name.

### Required docs discovery

1. Entry: `.docs/README.md` (precedence + reading orders).
2. **New product / fresh session / clone:** `.docs/product-kickoff.md` first.
3. Then open only the docs for the task (do not read everything by default):
   - UI conventions → `.docs/coding-conventions.md`
   - Which kit component → `.docs/shared-ui-catalog.md`
   - Kit sync with products → `.docs/platform-kit-sync.md`
   - Screens → `.docs/folder-structure.md`, `.docs/screen-standard.md`
   - Shared UI/theme changes → `.docs/ui-theme-standard.md`
   - API / RTK / auth → `.docs/data-state-standard.md`
   - Missing UX detail → `.docs/default-behavior-rules.md`
   - SEO (title/meta/OG/JSON-LD/robots/sitemap) → `.docs/seo-standard.md`
   - Ambiguity → precedence in `.docs/README.md`
   - Prompt templates → `.docs/prompt-template-scope-lock.md`, `prompt-template-feature.md`, `prompt-template-full-app.md`
4. Platform OpenSpec capabilities under `openspec/specs/` are **baseline already shipped** — read `openspec/specs/README.md` before treating them as work to redo.
5. Large / multi-screen / unclear AC → scope-lock before coding.

### Key commands

| Action | Command |
|--------|---------|
| Install deps | `yarn install` |
| Lint | `yarn lint` |
| Tests | `npx dotenv -e .env.test -- yarn test` |
| Start (web) | `yarn start` then `w`, or `npx dotenv -e .env.test -- npx expo start --web --port 8081` |

### Non-obvious caveats

- **Tests need env:** `yarn test` without env fails `axios-instance` tests — use `npx dotenv -e .env.test -- yarn test`.
- **Expo CLI:** no `--non-interactive`; use `CI=1` if needed.
- **postinstall:** copies `canvaskit.wasm` into `public/` (`mkdir public` warning is harmless).
- **DummyJSON demo login:** `emilys` / `emilyspass`.
- **Playground bundler warnings:** some co-located non-route files under `playground/` warn “missing default export” — ignore for demos.
- **SEO is off by default:** `seo.config.json` ships with `enabled: false` — zero effect on mobile-only/admin products until a task explicitly turns it on. See `.docs/seo-standard.md` before touching anything SEO-related; it documents a real gotcha (`AppInitGate` hides `<head>` tags from static export unless mounted above it) that already broke this once.
