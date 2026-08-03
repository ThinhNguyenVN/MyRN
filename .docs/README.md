# Project conventions

This directory defines the working conventions for this app.

The goal is not to document every file in the repo. The goal is to give humans and AI agents a small set of strict references that are easy to apply in concrete tasks.

## Core rules

- `src/app` = route shell only; production UI in `src/features`.
- `auth` / `todo` = canonical **structure** references, not mandatory product features.
- Starter `home` / tabs `index` = placeholders to replace when product defines home/tabs.
- `playground` = component catalog only, not production structure.
- Branches: `feat|fix|issue|release/` — never `cursor/`.
- **New product / fresh AI:** read `product-kickoff.md` before coding.

## Unified precedence (single source of truth)

Use this precedence when requirements seem ambiguous or conflicting:

1. explicit product requirements and accepted scope
2. design source of truth (Figma/Stitch/annotated notes)
3. existing pattern in the same feature
4. canonical references in `src/features/auth` and `src/features/todo`
5. fallback defaults in `default-behavior-rules.md`

If other docs summarize precedence in shorter form, this section wins.

## OpenSpec and product specs (two layers)

Do not confuse these:

| Layer | Path | Purpose |
|-------|------|---------|
| Conventions | `.docs/` | How to implement in this repo |
| Product scope | `specs/<feature-or-domain>.spec.md` | Durable product AC / assumptions (`specs/_template.spec.md`) |
| Change process | `openspec/changes/<change>/` | Propose → design → tasks → delta specs for one change |
| Platform baseline | `openspec/specs/` | Already-shipped capabilities — **not** a rebuild backlog (`openspec/specs/README.md`) |

Rules:

- For product features, always keep `specs/<name>.spec.md` updated.
- Use OpenSpec changes when the team wants propose/apply workflow; delta specs sync into `openspec/specs/` on archive.
- Do not invent a third parallel spec system.
- OpenSpec **change artifacts** are Vietnamese (`openspec/config.yaml`). `.docs/` and product `specs/*.spec.md` stay English unless the user asks otherwise.
- Before large/ambiguous product work, use `prompt-template-scope-lock.md` when mandatory triggers apply.

## Read this file first, then pick the matching spec

- `product-kickoff.md`: start here when turning this template into a real product (scope, replace starters, features vs references, API boundary).
- `folder-structure.md`: where code belongs.
- `screen-standard.md`: how one production screen should be built.
- `coding-conventions.md`: general coding conventions (component files, handlers, My* elements, theme tokens, layout breakpoints).
- `component-code-standard.md`: redirect stub → `coding-conventions.md`.
- `ui-theme-standard.md`: how to use shared components, tokens, and styles.
  Includes rules for large visual redesigns and when to refactor shared UI/theme layers.
- `shared-ui-catalog.md`: product UI kit decision table — which `My*` / shared UI to use (card, divider, skeleton, empty/error, search, form checkbox, image preview).
- `data-state-standard.md`: how to call APIs and structure RTK Query, Redux Toolkit, hooks, and auth.
- `default-behavior-rules.md`: fallback product and UX behavior when the design or prompt does not specify enough detail.
- `canonical-references.md`: which existing files are the source of truth when there is ambiguity.
- `prompt-template-full-app.md`: reusable prompt template for generating a whole app or a large domain.
- `prompt-template-feature.md`: reusable prompt template for implementing one feature or a small set of screens.
- `prompt-template-scope-lock.md`: reusable prompt template for a planning or scope-confirmation pass before coding.
- `../specs/_template.spec.md`: reusable spec artifact template for durable scope, assumptions, and traceability.

## Suggested AI reading order by task

### Start a real product on this template

Read:

1. `product-kickoff.md`
2. `folder-structure.md`
3. `shared-ui-catalog.md`
4. `default-behavior-rules.md`
5. `canonical-references.md`
6. Then `prompt-template-scope-lock.md` (or feature/full-app template once scope is clear)

### Add a new screen

Read:

1. `folder-structure.md`
2. `screen-standard.md`
3. `coding-conventions.md`
4. `shared-ui-catalog.md`
5. `default-behavior-rules.md`
6. `canonical-references.md`

### Add or update shared UI

Read:

1. `coding-conventions.md`
2. `ui-theme-standard.md`
3. `shared-ui-catalog.md`
4. `default-behavior-rules.md`
5. `canonical-references.md`

### Add or update API, RTK Query, Redux Toolkit, or auth state

Read:

1. `data-state-standard.md`
2. `default-behavior-rules.md`
3. `canonical-references.md`

### Build a whole app or a large new domain **on this template**

This is product work on an existing platform — **not** a greenfield rewrite.

Read:

1. `product-kickoff.md`
2. `folder-structure.md`
3. `data-state-standard.md`
4. `screen-standard.md`
5. `shared-ui-catalog.md` (+ `ui-theme-standard.md` if changing shared visuals)
6. `default-behavior-rules.md`
7. `canonical-references.md`

Build in this order:

1. Confirm inputs + scope-lock / `specs/<name>.spec.md`
2. Keep shell/providers; only adjust routes/groups the product needs
3. First vertical slice under `src/features`
4. Thin routes under `src/app`; replace starter home/tabs when in scope
5. Point API env at real backend when required; keep RTK Query boundaries
6. Cleanup against canonical references + kit catalog

### Review whether code follows project rules

Read all files in this directory, then compare the change against `src/features/auth` and `src/features/todo`.

### Ask AI to build a new app or feature from designs

Use one of these templates as the starting prompt:

1. `prompt-template-scope-lock.md` for planning and ambiguity reduction before coding
2. `prompt-template-feature.md` for one feature or a few screens
3. `prompt-template-full-app.md` for a whole app or a large domain

### Scope-lock policy (mandatory triggers)

Run a scope-lock pass before coding when any of these is true:

1. Multi-screen flow (2 or more production screens)
2. Multiple design sources (for example Figma plus Stitch plus notes/screenshots)
3. API/auth/state changes that affect more than one layer
4. Acceptance criteria are not explicit
5. Shared UI/theme refactor is expected

Scope-lock may be skipped only for tiny changes:

- copy-only updates
- visual tweaks on one screen with no flow/data impact
- refactors with no behavior change

Scope-lock output must include:

- in-scope items
- out-of-scope items
- assumptions
- open questions
- implementation order
- architecture mapping (`src/app` vs `src/features` vs shared layers)

## What this docs set intentionally does not do

- It does not treat `playground` as production structure.
- It does not encourage inventing new patterns when a canonical one already exists.
- It does not allow route files to become feature modules.

## Golden path

When starting a real product on this template, follow `product-kickoff.md`.
When adding a feature, copy the shape and boundaries from `auth` and `todo` first. Only create a new pattern if both canonical features fail to cover the use case.
