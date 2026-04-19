# Folder structure standard for `my-rn`

This file defines the required project structure for apps generated from `create-myrn-app`.

## Core principles

- `src/app` is route shell only.
- Real screen implementation lives in `src/features`.
- `auth` and `todo` are the canonical reference features.
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

### Target route shape

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

Use `src/app/(public)/(tabs)/playground` only to learn how a component behaves, not how a production feature should be structured.

## Quick review checklist

- Is the route file thin and route-focused?
- Does real implementation live in `src/features`?
- Does the feature use existing shared layers before adding new abstractions?
- Does the code follow canonical patterns from `auth` or `todo`?
