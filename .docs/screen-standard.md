# Screen standard

This file defines the required shape for new production screens in this codebase.

## Core rule

Every production screen should follow the `container + view + styles + optional screen hook/types` pattern used by `auth` and `todo`.

Use these as the primary references:

- `src/features/auth/screens/login-screen.container.tsx`
- `src/features/auth/screens/login-screen.view.tsx`
- `src/features/auth/screens/use-login.ts`
- `src/features/todo/screens/todo-list.container.tsx`
- `src/features/todo/screens/todo-list.view.tsx`
- `src/features/todo/screens/todo-form.container.tsx`
- `src/features/todo/screens/todo-form.view.tsx`

Do not use `playground` screen structure as the production reference.

## Required screen split

Recommended shape:

```text
src/features/<feature>/screens/
├ <screen>.container.tsx
├ <screen>.view.tsx
├ <screen>.types.ts
├ styles.ts
└ use-<screen>.ts
```

Rules:

- `container.tsx` is required for production screens.
- `view.tsx` is required for production screens.
- `styles.ts` is required.
- `types.ts` is required when the screen has form types, view props, or route param types.
- `use-<screen>.ts` is optional, but recommended when container logic becomes noisy.

## `container.tsx` responsibilities

Allowed:

- read route params
- call RTK Query hooks
- call Redux hooks and dispatch thunks/actions
- own submit handlers
- own navigation handlers
- map raw data into view props
- compose `MyForm` for form screens

Not allowed:

- large JSX trees
- repeated styling details that belong in the view
- direct low-level API calls with `axios`

Good examples:

- `login-screen.container.tsx`
- `todo-list.container.tsx`
- `todo-form.container.tsx`

## `view.tsx` responsibilities

Allowed:

- render UI
- receive props and callbacks
- call screen-local presentational hooks if they do not own business orchestration
- use `useTranslation`
- use `useThemedStyles(generateStyles)`

Not allowed:

- `router.push`, `router.replace`, `router.back`
- `dispatch`
- RTK Query hooks
- direct store reads unless there is a very strong reason and the screen is still clearly presentational

When the view becomes large, extract feature-only presentational pieces into `features/<feature>/components/` as **flat** `.tsx` files with shared `components/styles.ts` + `components/type.ts`. Do not use the shared-kit folder layout (`index` + per-component `styles`/`type`) for those, and do not move them into `src/components/ui`. See `.docs/folder-structure.md` and `.docs/coding-conventions.md` §1.

### Raw `View` usage

Raw `View` is allowed for simple wrappers and very local layout.

Use `MyView` when you need any of these:

- semantic background color
- radius/elevation support
- reusable layout container semantics
- container props from the shared style system

Do not introduce raw `Text`, raw `Button`, raw text input, or raw list primitives in production screens when an existing shared component already exists.

## Form screen standard

Form screens should follow this flow:

1. `container.tsx` creates `MyForm`
2. schema is defined with `zod`
3. default values are defined in `types.ts`
4. view uses `MyForm*` adapters
5. submit handler is owned by container or a dedicated screen hook
6. native form body scroll uses `MyKeyboardAvoiding.ScrollView` (not RN `ScrollView`) whenever `MyTextInput` / `MyFormTextInput` can be covered by the keyboard

Do **not** wrap header / list-toolbar search. `MyTextInput` inside `MyBottomSheet` uses `useBottomSheetTextInput`. Sticky footers stay outside the avoiding scroll. Web may keep a plain `ScrollView` (the kit already falls back). Canonical wrap: `login-screen.container.tsx`, `todo-form.view.tsx`.

Expected shape:

```text
src/features/<feature>/screens/
├ <feature>-form.container.tsx
├ <feature>-form.view.tsx
├ <feature>-form.types.ts
└ styles.ts
```

## List screen standard

List screens should follow this flow:

1. `container.tsx` owns query, refresh state, mutations, and navigation
2. `view.tsx` owns rendering
3. shared list behavior should go through `MyList`
4. async UI should use the product kit: `MySkeleton` / `MyErrorState` / `MyEmptyState` (see `shared-ui-catalog.md`)
5. row surfaces should prefer `MyCard`; separators `MyDivider`; search `MySearchInput`
6. row interactions should prefer shared UI patterns such as `SwipeableItem`

Canonical wiring: `src/features/todo/screens/todo-list.view.tsx`.

### List screen MUST refetch on focus

There is no realtime DB in this app — data shown on any list (or dashboard-style aggregate) screen
can go stale the moment another screen changes it (create/update/delete/approve/cancel elsewhere,
or the same record edited from a different tab). Every list/dashboard screen's data-fetching hook
(the `use-<screen>.ts` hook, or the container itself when there is no separate hook) **MUST** call:

```ts
import { useFocusEffect } from 'expo-router'

useFocusEffect(
  useCallback(() => {
    void refetch()
  }, [refetch]),
)
```

right after the RTK Query hook(s) it refetches — not only on first mount, and not only via manual
pull-to-refresh/retry buttons. This is required even if pull-to-refresh already exists; focus-based
refetch covers the common case where the user navigates away, changes data on another screen, and
comes straight back without thinking to pull down.

If the screen composes **more than one** independent query into a single `refetchAll`, do not put
the raw query result objects in that `useCallback`'s dependency array — RTK Query hook results are
new object references on every fetch-state change, so a `refetchAll` built that way gets a new
identity mid-refetch, and `useFocusEffect` re-running on every identity change becomes an infinite
refetch loop. Route the `.refetch()` calls through a `useRef` instead so `refetchAll` stays a
stable, empty-deps function while still always calling the latest queries. A single-query screen
does not need this — `refetch` itself is already a stable reference, so
`useFocusEffect(useCallback(() => void refetch(), [refetch]))` is enough — see
`src/features/todo/screens/todo-list.container.tsx` for the reference implementation.

`useFocusEffect` cannot be meaningfully unit-tested in this codebase (it pulls in a native module
that Jest cannot resolve) — verify it manually in the running app, not with a test.

## `styles.ts` standard

Rules:

- export `generateStyles(theme)`
- read colors, spacing, radius, elevation, and insets from `theme`
- do not hardcode production colors in feature styles
- keep component-specific style objects in the screen style file, not inside the container

## Screen hook standard

Create `use-<screen>.ts` when:

- submit logic is non-trivial
- form error handling is noisy
- container would become hard to scan

The `login` feature is the canonical example for this pattern.

## Route integration rule

The corresponding file in `src/app` should stay thin:

- re-export the container, or
- do a redirect/auth check and then mount the container

The route file must not become the real screen implementation.

### Route path constants

- Prefer shared route constants for reusable app paths.
- Do not spread hardcoded route strings across feature screens when a route is reused in more than one place.
- If the app already has a route constants module, extend it instead of inventing feature-local path strings.

## Anti-patterns

Avoid these in new production screens:

- building a full screen inside `src/app`
- calling `axios` directly from a screen
- mixing query logic and large JSX in one file
- copying the `playground` route structure
- hardcoding colors, spacing, or typography values in feature screens

## Quick review checklist

- Does the screen have a clear `container` and `view` split?
- Is navigation/data orchestration kept out of the `view`?
- Does the form use `MyForm` and `MyForm*` adapters (including `MyFormCheckbox` when needed)?
- Does the form body use `MyKeyboardAvoiding.ScrollView` for native text inputs (excluding header search)?
- Does the list use `MyList` instead of raw list primitives?
- Does the list use `MySkeleton` / `MyEmptyState` / `MyErrorState` for async states?
- Does a list/dashboard screen refetch on focus (`useFocusEffect`), not just on mount/pull-to-refresh?
- Does the screen look closer to `auth` or `todo` than to `playground`?

## Default behavior fallback

If a design or prompt does not define screen behavior clearly enough, follow `.docs/default-behavior-rules.md` instead of inventing one-off behavior per screen.
