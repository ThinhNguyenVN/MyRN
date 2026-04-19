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

- `src/app/(private)/todo/index.tsx` and `src/app/(private)/todo/form.tsx` already follow the target rule.
- `src/app/(public)/login.tsx` is also acceptable because it only does a redirect check and mounts the feature screen.
- `src/app/(public)/(tabs)/index.tsx` and files under `src/app/(public)/(tabs)/playground` are useful references today, but new production features should not copy that structure.
- `playground` route files are exempt as component demos, but production features must not copy their structure.

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
  ├ <feature>-api.ts
  ├ <feature>-slice.ts
  ├ <feature>-thunks.ts
  ├ types.ts
  └ <feature>-specific-files.ts
```

Notes:

- Keep the current naming convention such as `auth-api.ts`, `auth-slice.ts`, `auth-thunks.ts`.
- A feature may omit files it does not need.
- Avoid creating `components/` and `hooks/` folders inside a feature until the feature is large enough to justify them.

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
