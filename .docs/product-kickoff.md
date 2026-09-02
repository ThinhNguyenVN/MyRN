# Product kickoff (template → real product)

Use this when starting a **real product** on this repo (or a clone), especially with a **fresh AI session** and no prior chat context.

This repo is a **ready platform template**. Do **not** rebuild Expo/SDK, shared UI kit, or reinvent architecture before product work unless product scope explicitly requires it.

## What the human must provide

Without these, do scope-lock / ask — do not invent a product:

1. Product goal (1 short paragraph)
2. In-scope screens/flows + out-of-scope
3. Design source of truth (Figma / Stitch / notes) or an explicit “use project UX defaults”
4. API: keep DummyJSON for demos, **or** real base URL + auth rules
5. Whether starter `home` / tabs should be replaced in this iteration

## What is already ready (baseline)

- Expo SDK 57 shell (iOS / Android / Web)
- Theme + `My*` kit — prefer `shared-ui-catalog.md`
- `auth` + `todo` = **structure references only** (not required product features)
- RTK Query / Redux / form / i18n patterns — `data-state-standard.md`
- Web SEO (title/meta/OG/JSON-LD/robots/sitemap), config-driven and **off by default**
  — `seo-standard.md`
- Playground = component catalog only
- Conventions in `.docs/` + change process via OpenSpec

## Spec systems (do not confuse)

| Path | Role | When to use |
|------|------|-------------|
| `.docs/` | How to build in this repo | Always for conventions |
| `specs/<name>.spec.md` | Durable **product** scope / AC (template: `specs/_template.spec.md`) | Every product feature / domain |
| `openspec/changes/<change>/` | Active OpenSpec change (proposal, design, tasks, delta specs) | Planning/implementing a named change |
| `openspec/specs/` | **Shipped platform** capabilities (already done) | Only when changing that capability — **not** a product backlog |

Do not treat `openspec/specs/*` as “todo list to re-implement.” See `openspec/specs/README.md`.

OpenSpec change artifacts in this repo are written in **Vietnamese** (`openspec/config.yaml`). Product `specs/*.spec.md` and `.docs/` are **English** unless the user asks otherwise.

## Four kickoff rules

### 1. Scope and design before coding

- Start from requirements + design, not invented screens.
- Multi-screen / unclear AC / multi-source design → **scope-lock** (`prompt-template-scope-lock.md`) first.
- Then OpenSpec propose/apply **and/or** fill `specs/<name>.spec.md`.
- Silent UX → `default-behavior-rules.md`.

### 2. Replace starter home / tabs when product defines them

- Placeholders: `src/app/(public)/home.tsx`, `src/app/(public)/(tabs)/index.tsx`.
- Replace per `folder-structure.md`; keep routes thin; keep `playground`.

### 3. Product code under `src/features` — copy shape from auth/todo

- Screens: `container + view + styles` (`screen-standard.md`).
- Routes in `src/app` stay thin.
- Prefer kit from `shared-ui-catalog.md` before one-off empty/error/card/search UI.
- Reusable kit added while shipping a product must be backported here per `platform-kit-sync.md`.
- Product may omit todo/auth as business features.

### 4. Swap API via env + same data-state pattern

- Template default: DummyJSON via `EXPO_PUBLIC_API_BASE_URL`.
- Real API: same `createApi` / thunk / slice rules (`data-state-standard.md`); update env files; do not add a second HTTP stack.

## First session checklist

1. Read `AGENTS.md` → `.docs/README.md` → this file.
2. Confirm the five human inputs above.
3. Scope-lock if required (`README.md` scope-lock policy).
4. Branch `feat/<description>` (never `cursor/`).
5. Write/update `specs/<name>.spec.md` → implement first vertical slice in `src/features` → thin routes → replace starters if in scope.
6. Use `shared-ui-catalog.md` + `default-behavior-rules.md` when design is silent.

## Anti-patterns at kickoff

- Rewriting architecture because product screens are not present yet
- Keeping sample home/todo UX when product scope replaces them
- Copying playground structure into production features
- Re-implementing items already covered by `openspec/specs/`
- Skipping scope-lock on large/ambiguous builds

## Next reads

| Need | Doc |
|------|-----|
| Precedence + reading orders | `README.md` |
| Folders / starters | `folder-structure.md` |
| Screen split | `screen-standard.md` |
| Which `My*` | `shared-ui-catalog.md` |
| Sync kit ↔ products | `platform-kit-sync.md` |
| API / Redux | `data-state-standard.md` |
| UX fallbacks | `default-behavior-rules.md` |
| Canonical code | `canonical-references.md` |
| SEO (public web products only) | `seo-standard.md` |
| Prompts | `prompt-template-scope-lock.md`, `prompt-template-feature.md`, `prompt-template-full-app.md` |
