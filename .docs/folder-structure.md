# Folder structure standard

This file defines the required project structure for this repository and for future work done inside apps that follow the same conventions.

## Core principles

- `src/app` is route shell only.
- Real screen implementation lives in `src/features`.
- `auth` and `todo` are the canonical reference features in this repository. They are reference implementations, not mandatory feature names for every app.
- `playground` stays in the app as a usage catalog, but it is not a structure reference.
- Existing route files that still contain large screen implementations should be considered migration targets, not new examples to copy.

## Required top-level structure

```text
src/
├ app/
├ api/
├ components/
├ configs/
├ constants/
├ features/
├ hooks/
├ i18n/
├ store/
├ theme/
├ types/
└ utils/
```

## `src/app`: route shell only

Use `src/app` for Expo Router layout and route entry files only.

Allowed responsibilities:

- define route groups and stack/tab layout
- redirect based on auth or route conditions
- re-export a feature screen container

Not allowed in `src/app`:

- API calls
- business logic
- screen-specific state orchestration
- large presentational screen implementation

### Root layout responsibility

Keep app-wide providers and bootstrapping in the root layout area.

Typical responsibilities:

- theme provider
- Redux provider
- app init gate
- portal, bottom sheet, toast, and confirmation roots
- top-level public/private route groups

Do not move feature-specific business logic into the root layout.

### Target route shape

This route tree is an example of the preferred shell pattern, not a mandatory list of route names.

```text
src/app/
├ _layout.tsx
├ (public)/
│ ├ _layout.tsx
│ ├ login.tsx
│ └ (tabs)/
│   ├ _layout.tsx
│   ├ index.tsx
│   └ playground/
└ (private)/
  ├ _layout.tsx
  └ todo/
    ├ index.tsx
    └ form.tsx
```

### Route file rules

- Prefer `export { default } from '@/features/<feature>/screens/<screen>.container'`.
- If a route must do redirect logic, keep it very thin.
- Do not build full screens directly inside route files unless the route is temporary and explicitly exempted.
- Prefer shared route constants when route paths are reused across features.

### Current repo note

- Good thin routes: `src/app/(private)/todo/*`, `src/app/(public)/login.tsx`.
- Starter placeholders to replace for product home/tabs: `src/app/(public)/home.tsx`, `src/app/(public)/(tabs)/index.tsx`.
- `playground` stays as component demos only — never copy its structure into production features.

### Home and tabs replacement rule

When implementing a new home experience:

- replace starter implementation in `src/app/(public)/home.tsx` and/or `src/app/(public)/(tabs)/index.tsx` based on the requested navigation model
- keep route files thin and move real screen implementation to `src/features/<feature>/screens/*`
- do not preserve starter home/tabs behavior unless explicitly required by product scope

## `src/features`: the real app surface

Each feature owns its data layer, screens, types, and feature-specific logic.

Recommended shape:

```text
src/features/
└ <feature>/
  ├ screens/
  │ ├ <screen>.container.tsx
  │ ├ <screen>.view.tsx
  │ ├ <screen>.types.ts
  │ └ styles.ts
  ├ components/                 # feature-only UI (optional; when view gets large)
  │ ├ styles.ts                 # shared styles for these components
  │ ├ type.ts                   # shared props types
  │ └ <name>.tsx                # flat: 1 file = 1 component (no nested folders)
  ├ <feature>-api.ts
  ├ <feature>-slice.ts
  ├ <feature>-thunks.ts
  ├ types.ts
  └ <feature>-specific-files.ts
```

Notes:

- Use kebab-case for file and folder names (for example `todo-form.container.tsx`, `auth-api.ts`, `my-list.tsx`).
- Keep the current naming convention such as `auth-api.ts`, `auth-slice.ts`, `auth-thunks.ts`.
- A feature may omit files it does not need.
- **Feature-only presentational UI** → `features/<feature>/components/` (flat files + shared `styles.ts` / `type.ts`). Do **not** use the shared-kit layout (folder + `index` + per-component `styles`/`type`) here.
- **Cross-feature / reusable kit** → `src/components/{elements,form,ui}/` only. Do **not** put single-feature cards into `src/components/ui`.

## Shared layers

### `src/components`

- `elements/`: primitives and reusable controls
- `form/`: adapters for `react-hook-form`
- `ui/`: shared composite patterns such as navigation bar, list, toast, confirmation, swipeable rows

### `src/api`

- shared HTTP client
- base query adapter
- error normalization

### `src/store`

- root Redux store
- typed hooks
- store reference helpers

### `src/theme`

- tokens
- theme context
- spacing, typography, radius, elevation

## Canonical references

Use these as the source of truth when there is ambiguity:

1. `src/features/auth`
2. `src/features/todo`

These folders are reference implementations for structure and boundaries. New apps may have different feature names.

Use `src/app/(public)/(tabs)/playground` only to learn how a component behaves, not how a production feature should be structured.

## Quick review checklist

- Is the route file thin and route-focused?
- Does real implementation live in `src/features`?
- Does the feature use existing shared layers before adding new abstractions?
- Does the code follow canonical patterns from `auth` or `todo`?
