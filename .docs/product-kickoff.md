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
| `specs/<product>-overview.spec.md` | Product-level **feature roadmap** — every main feature, slug, priority, status (template: `specs/_overview-template.spec.md`) | Once per product, **before** any per-feature spec/change, when the product has 2+ main features |
| `openspec/changes/<change>/` | Active OpenSpec change (proposal, design, tasks, delta specs) | Planning/implementing a named change |
| `openspec/specs/` | **Shipped platform** capabilities (already done) | Only when changing that capability — **not** a product backlog |

Do not treat `openspec/specs/*` as “todo list to re-implement.” See `openspec/specs/README.md`.

OpenSpec change artifacts in this repo are written in **Vietnamese** (`openspec/config.yaml`). Product `specs/*.spec.md` and `.docs/` are **English** unless the user asks otherwise.

## Five kickoff rules

### 1. Scope and design before coding

- Start from requirements + design, not invented screens.
- Multi-screen / unclear AC / multi-source design → **scope-lock** (`prompt-template-scope-lock.md`) first.
- Then OpenSpec propose/apply **and/or** fill `specs/<name>.spec.md`.
- Silent UX → `default-behavior-rules.md`.

### 2. Write a product overview before per-feature specs (when 2+ main features)

- If the product has **2 or more main features**, write `specs/<product>-overview.spec.md`
  (template: `specs/_overview-template.spec.md`) **before** creating any per-feature
  `specs/<name>.spec.md` or opening any `openspec/changes/<feature>/`.
- List every planned main feature with a **stable slug**, priority, and status
  (`Not started | In progress | Done`).
- The slug is the contract: implementing a feature later opens `openspec/changes/<slug>/`
  and/or `specs/<slug>.spec.md` using that **exact slug** — do not rename at implementation time.
- Keep the overview high-level (feature list + status only); full AC/design/flows live in the
  per-feature spec or OpenSpec change, not here. Update status as features progress.
- Single-feature products skip this rule — go straight to scope-lock / spec for that one feature.

### 3. Replace starter home / tabs when product defines them

- Placeholders: `src/app/(public)/home.tsx`, `src/app/(public)/(tabs)/index.tsx`.
- Replace per `folder-structure.md`; keep routes thin; keep `playground`.

### 4. Product code under `src/features` — copy shape from auth/todo

- Screens: `container + view + styles` (`screen-standard.md`).
- Routes in `src/app` stay thin.
- Prefer kit from `shared-ui-catalog.md` before one-off empty/error/card/search UI.
- Reusable kit added while shipping a product must be backported here per `platform-kit-sync.md`.
- Product may omit todo/auth as business features.

### 5. Swap API via env + same data-state pattern

- Template default: DummyJSON via `EXPO_PUBLIC_API_BASE_URL`.
- Real API: same `createApi` / thunk / slice rules (`data-state-standard.md`); update env files; do not add a second HTTP stack.

## First session checklist

1. Read `AGENTS.md` → `.docs/README.md` → this file.
2. Confirm the five human inputs above.
3. If the product has 2+ main features, write `specs/<product>-overview.spec.md` (rule 2)
   before anything else below.
4. Scope-lock if required (`README.md` scope-lock policy).
5. Branch `feat/<description>` (never `cursor/`).
6. Write/update `specs/<name>.spec.md` → implement first vertical slice in `src/features` → thin routes → replace starters if in scope.
7. Use `shared-ui-catalog.md` + `default-behavior-rules.md` when design is silent.

## Anti-patterns at kickoff

- Rewriting architecture because product screens are not present yet
- Keeping sample home/todo UX when product scope replaces them
- Copying playground structure into production features
- Re-implementing items already covered by `openspec/specs/`
- Skipping scope-lock on large/ambiguous builds
- Skipping the product overview for a 2+ feature product, then inventing per-feature scope ad hoc

## Before shipping web to production

- **Delete (or exclude) the `playground` route group** (`src/app/(public)/(tabs)/playground`) before
  building the production web bundle. `web.output: "static"` ships one shared JS bundle for the whole
  app with no route code-splitting, so all ~47 playground/demo screens ride along inside the real
  product's bundle if left in — measured at 4.27MB minified / ~1.06MB gzip including them (see
  `expo-ssr-gap-analysis.md`, "Audit lib native-first cho web bundle"). Keeping `playground` during
  development is correct (rule 2 above); removing it is a pre-launch step, not a kickoff step.
- Re-run the bundle audit after removing it (`npx dotenv -e .env.test -- npx expo export -p web
  --source-maps`, see the same doc for the analysis method) to confirm the real production size before
  go-live.

## Next reads

| Need | Doc |
|------|-----|
| Product feature roadmap | `specs/_overview-template.spec.md` |
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
