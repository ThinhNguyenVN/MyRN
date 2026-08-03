# Default behavior rules

Use this file when a design, prompt, or product note does not specify a behavior clearly enough.

These defaults are intended to reduce random AI guesswork. They apply only when a clearer source of truth does not exist.

## Precedence

Follow the unified precedence in `.docs/README.md`.
This file is the fallback layer when behavior details are still missing after applying that precedence.

## Core principle

When behavior is unspecified, prefer the safest and most conservative UX that:

- keeps architecture clean
- avoids destructive surprises
- preserves user input
- gives visible feedback for async work
- stays consistent with the shared UI and state patterns in this codebase

## Navigation defaults

### Screen entry

- Use the route structure required by `folder-structure.md`.
- Keep route files thin and feature-driven.
- Prefer shared route constants when a path is reused.

### Screen exit

- After a successful create or edit flow, default to `router.back()` unless the product explicitly needs a redirect elsewhere.
- After a destructive action inside a list/detail flow, stay on the current screen unless the deleted entity is the current screen's primary subject.
- If deleting the current subject would leave the screen invalid, navigate back after success.

### Auth gating

- If a flow requires authentication and the app already has an auth gate pattern, reuse it.
- Do not invent a second auth gate pattern inside feature screens.

## Async action defaults

### Buttons and submit actions

- Disable the primary action while the request is in flight.
- Show a loading indicator on the action that triggered the request.
- Prevent duplicate submits while the same request is pending.

### Initial loading

- If the primary screen content depends on the first fetch, show a clear loading state instead of a blank screen.
- Prefer `MySkeleton` with an appropriate preset (`listRow` / `textBlock` / `card`) when the content shape is list- or card-like.
- Prefer the shared loading treatment already used by nearby canonical screens (`todo` list).

### Refetching

- When old data is already visible, keep the current content on screen during background refetch when possible.
- Do not replace stable content with a full-screen loader for small background refreshes.

## Empty state defaults

- Never leave an empty list or blank container without explanation.
- Use `MyEmptyState` (`title` required; `subtitle` / CTA optional).
- Show a concise empty title and, when useful, one supporting line.
- If there is an obvious next action, expose it from the empty state (`actionLabel` + `onActionPress`).

Examples:

- an empty list should explain that there is no data yet
- a search result screen should explain that no matches were found

## Error state defaults

### Form submit errors

- Keep the user on the current screen.
- Preserve all entered values.
- Show a clear inline error or field error near the form.
- Do not clear the form on failure.

### Data fetch errors

- Show a recoverable error state with a retry path via `MyErrorState` (`message` + `onRetry`).
- If stale data exists, prefer keeping the stale data visible and surface the error non-destructively.

### Destructive mutation errors

- Show feedback that the action failed.
- Roll back optimistic UI if the data layer supports it.

## Success feedback defaults

- For save/create/update flows, use the smallest feedback that still makes the result clear.
- If the screen returns immediately after success, a toast is optional.
- If the user remains on the same screen, prefer a toast or inline success feedback.

## Confirmation defaults

Require confirmation when the action is destructive or may discard meaningful user input.

Default cases:

- delete
- sign out if unsaved work would be lost
- discard dirty form changes
- irreversible state changes

Do not add confirmation for harmless or easily reversible actions unless the product explicitly asks for it.

## Form defaults

- Use `MyForm` and `MyForm*` adapters.
- Prefer `MyFormCheckbox` for checkbox/radio fields (not ad-hoc `MyCheckbox` + `Controller`).
- Validate with `zod`.
- Trim text input on submit unless whitespace is product-significant.
- Keep entered values when validation or submit fails.
- Scroll or focus to the first invalid field when practical.
- Use field-level validation messaging when the issue belongs to a specific field.
- Use a root-level message when the issue is cross-field or comes from the server.

## List defaults

- Prefer `MyList` for production lists.
- Prefer `MyCard` for list/settings row surfaces; `MyDivider` for section separators; `MySearchInput` for search.
- Async UI order: `MySkeleton` → `MyErrorState` (+ retry) → `MyEmptyState` → content. See `shared-ui-catalog.md`.
- If the screen is list-first, support refresh when the app pattern already supports it.
- If an item action is destructive, use confirmation or a clearly intentional affordance.
- If optimistic updates improve responsiveness and the feature is list-heavy, prefer optimistic behavior in the API layer.

## Text and i18n defaults

- Follow the existing text strategy used by the surrounding feature.
- If the feature already uses `useTranslation`, add keys instead of hardcoding new user-facing strings.
- Do not mix two different copy strategies in the same feature without a reason.

## Visual defaults

- Prefer shared components before new wrappers — start from `shared-ui-catalog.md`.
- Prefer token-based colors, spacing, typography, radius, and elevation.
- Use raw `View` only for simple local wrappers.
- Do not copy extra wrapper noise from `playground`.

## State defaults

- Use RTK Query for server-backed data unless there is a clear reason not to.
- Use Redux slice for client-owned app state, not server cache copies.
- Use thunks for orchestration and persistence, not for normal CRUD that RTK Query already handles well.

## Whole-app generation defaults

When generating a whole app and the prompt does not specify enough behavior detail:

1. build the shell and providers first
2. create shared boundaries second
3. build one vertical slice end to end
4. reuse that slice pattern for the rest of the app
5. keep route files thin

Do not invent a second architecture once the first feature slice has established the pattern.

## Escalation rule

If the missing behavior would materially change business logic or navigation, do not silently invent a risky rule. Choose the most conservative option and state the assumption in your summary.
