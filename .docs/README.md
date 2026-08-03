# Project conventions

This directory defines the working conventions for this app.

The goal is not to document every file in the repo. The goal is to give humans and AI agents a small set of strict references that are easy to apply in concrete tasks.

## Core rules

- `src/app` is route shell only.
- Production screen implementation lives in `src/features`.
- `src/features/auth` and `src/features/todo` are the canonical reference features.
- `auth` and `todo` are reference implementations for architecture and code shape, not mandatory product features for every app.
- Starter routes under `src/app/(public)` such as `home.tsx` and `(tabs)/index.tsx` are sample placeholders and must be replaced when product scope requires a new home flow.
- `src/app/(public)/(tabs)/playground` stays in the app as a component usage catalog.
- `playground` is not a structure reference for production code.
- Branch names must use `feat/`, `fix/`, `issue/`, or `release/`.
- Do not create or use `cursor/` branches for normal development work.

## Unified precedence (single source of truth)

Use this precedence when requirements seem ambiguous or conflicting:

1. explicit product requirements and accepted scope
2. design source of truth (Figma/Stitch/annotated notes)
3. existing pattern in the same feature
4. canonical references in `src/features/auth` and `src/features/todo`
5. fallback defaults in `default-behavior-rules.md`

If other docs summarize precedence in shorter form, this section wins.

## OpenSpec integration

- OpenSpec is the process layer for planning and execution.
- `specs/<feature-or-domain>.spec.md` is the required durable artifact output.
- Use `specs/_template.spec.md` as the default structure unless scope explicitly requires a narrower format.
- Use `prompt-template-scope-lock.md` before implementation when mandatory scope-lock triggers apply.
- Do not run a parallel spec workflow outside `specs/`; keep one source of truth per change.

## Read this file first, then pick the matching spec

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

### Build a whole app or a large new domain

Read:

1. `folder-structure.md`
2. `data-state-standard.md`
3. `screen-standard.md`
4. `ui-theme-standard.md`
5. `shared-ui-catalog.md`
6. `default-behavior-rules.md`
7. `canonical-references.md`

Build in this order:

1. app shell, providers, and store integration
2. shared theme, UI, and API boundaries
3. feature modules under `src/features`
4. thin route files under `src/app`
5. final cleanup against canonical references

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

When adding a feature, copy the shape and boundaries from `auth` and `todo` first. Only create a new pattern if both canonical features fail to cover the use case.
