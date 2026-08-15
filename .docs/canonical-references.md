# Canonical references

Use this file when a contributor or AI needs to know which parts of the repo are the real production references.

These are reference implementations, not mandatory business features for every app. A new app may have different domains and route names, but it should still copy the same structural boundaries and coding patterns.

## Scope of this file

For global precedence (product/design/feature/default fallback), follow `.docs/README.md`.
For template → product kickoff, follow `.docs/product-kickoff.md`.
Platform capability specs under `openspec/specs/` are shipped baseline — see `openspec/specs/README.md`.

This file defines canonical **code pattern** references only:

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
- native form field scroll via `MyKeyboardAvoiding.ScrollView` (`login-screen.container.tsx`; also `todo-form.view.tsx`)
- thunk-based orchestration when the flow spans API, Redux state, and persistence

## Canonical feature: `todo`

Use `src/features/todo` as the reference for:

- list and form screen structure
- RTK Query endpoint organization
- container and view split
- route re-export pattern
- optimistic cache updates
- list async UI with the product kit (`MySkeleton`, `MyEmptyState`, `MyErrorState`) and row surface via `MyCard`

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
- initial loading / empty / fetch-error wiring with shared empty/error/skeleton facades

## Shared UI kit (product components)

When a screen needs card / divider / search / async empty-error-skeleton / form checkbox / image gallery, use:

- Decision table + props: `.docs/shared-ui-catalog.md`
- Theme composition rules: `.docs/ui-theme-standard.md`
- Behavior when design is silent: `.docs/default-behavior-rules.md`

Canonical production call site for list async + card rows: `todo-list.view.tsx`.

## `playground`: allowed use and forbidden use

`src/app/(public)/(tabs)/playground` stays in the repository because it is useful for:

- quickly checking how an existing shared component behaves
- finding props and visual behavior examples
- manual experimentation by developers and AI

Product-kit playground entries (usage catalog only):

- `divider.tsx`, `card.tsx`
- `empty-state.tsx`, `error-state.tsx`, `skeleton.tsx`
- `search-input.tsx`, `form.tsx` (includes `MyFormCheckbox` + `MyKeyboardAvoiding.ScrollView`), `checkbox.tsx`, `text-input.tsx`
- `image-slider.tsx` (slider + fullscreen `ImagePreview`)

Do not use `playground` as the reference for:

- production folder structure
- screen composition standards
- style discipline
- view/layout cleanliness

Rule:

- Learn component behavior from `playground`.
- Learn production structure from `auth` and `todo`.
- Learn which kit component to pick from `shared-ui-catalog.md`.

## Review questions

- Did the new code follow `auth` or `todo` when a matching example existed?
- Was `playground` used only as a usage catalog?
- Did list/async screens reuse `MySkeleton` / `MyEmptyState` / `MyErrorState` / `MyCard` instead of inventing local equivalents?
- Did form screens wrap field scroll with `MyKeyboardAvoiding.ScrollView` (and leave header search unwrapped)?
- Did the contributor avoid copying extra `View` wrappers and loose styling from demo code?
