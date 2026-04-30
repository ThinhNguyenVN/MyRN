# Canonical references

Use this file when a contributor or AI needs to know which parts of the repo are the real production references.

These are reference implementations, not mandatory business features for every app. A new app may have different domains and route names, but it should still copy the same structural boundaries and coding patterns.

## Scope of this file

For global precedence (product/design/feature/default fallback), follow `.docs/README.md`.
This file defines canonical code pattern references only:

1. `src/features/auth`
2. `src/features/todo`
3. shared layers under `src/components`, `src/api`, `src/store`, and `src/theme`
4. `playground` for isolated component usage only

## Canonical feature: `auth`

Use `src/features/auth` as the reference for:

- auth state in Redux Toolkit
- auth bootstrap and persistence
- thunk orchestration
- login form structure
- route redirect behavior

Important files:

- `src/features/auth/auth-api.ts`
- `src/features/auth/auth-slice.ts`
- `src/features/auth/auth-thunks.ts`
- `src/features/auth/token-storage.ts`
- `src/features/auth/screens/login-screen.container.tsx`
- `src/features/auth/screens/login-screen.view.tsx`
- `src/features/auth/screens/use-login.ts`

What to copy from `auth`:

- a thin route that redirects and mounts a feature screen
- a form screen built with `MyForm` and `MyForm*` adapters
- thunk-based orchestration when the flow spans API, Redux state, and persistence

## Canonical feature: `todo`

Use `src/features/todo` as the reference for:

- list and form screen structure
- RTK Query endpoint organization
- container and view split
- route re-export pattern
- optimistic cache updates

Important files:

- `src/features/todo/todo-api.ts`
- `src/features/todo/types.ts`
- `src/features/todo/screens/todo-list.container.tsx`
- `src/features/todo/screens/todo-list.view.tsx`
- `src/features/todo/screens/todo-form.container.tsx`
- `src/features/todo/screens/todo-form.view.tsx`
- `src/features/todo/screens/todo-form.types.ts`
- `src/features/todo/screens/styles.ts`

What to copy from `todo`:

- route file as pure re-export
- server state handled with RTK Query
- view file as presentational UI only
- optimistic updates inside the API layer instead of ad hoc local state patches in screens

## `playground`: allowed use and forbidden use

`src/app/(public)/(tabs)/playground` stays in the repository because it is useful for:

- quickly checking how an existing shared component behaves
- finding props and visual behavior examples
- manual experimentation by developers and AI

Do not use `playground` as the reference for:

- production folder structure
- screen composition standards
- style discipline
- view/layout cleanliness

Rule:

- Learn component behavior from `playground`.
- Learn production structure from `auth` and `todo`.

## Review questions

- Did the new code follow `auth` or `todo` when a matching example existed?
- Was `playground` used only as a usage catalog?
- Did the contributor avoid copying extra `View` wrappers and loose styling from demo code?
