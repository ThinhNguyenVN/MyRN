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
4. row interactions should prefer shared UI patterns such as `SwipeableItem`

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
- Does the form use `MyForm` and `MyForm*` adapters?
- Does the list use `MyList` instead of raw list primitives?
- Does the screen look closer to `auth` or `todo` than to `playground`?

## Default behavior fallback

If a design or prompt does not define screen behavior clearly enough, follow `.docs/default-behavior-rules.md` instead of inventing one-off behavior per screen.
