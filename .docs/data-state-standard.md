# Data and state standard

This file defines how this codebase should handle API calls, server cache, app state, and auth state.

## Core rules

- Shared transport lives in `src/api`.
- Endpoint constants live in `src/constants/api.ts`.
- Server data uses RTK Query by default.
- Global app state uses Redux Toolkit slice only when RTK Query is not the right fit.
- Complex app bootstrapping and persistence flows may use thunks.
- Screens must use typed hooks from `src/store/hooks.ts`.

## Shared API layer

Use the shared stack that already exists in this repository:

- `src/constants/api.ts`
- `src/api/axios-instance.ts`
- `src/api/axios-base-query.ts`
- `src/api/errors.ts`

### Required rules

- Do not create a new Axios client inside a feature.
- Do not hardcode endpoint strings inside screens.
- Do not duplicate token refresh logic inside feature code.
- Do not bypass `axiosBaseQuery` for normal feature APIs.

## Endpoint definition

Put reusable paths and API config in `src/constants/api.ts`.

Keep using the current pattern:

- `API_BASE_URL`
- `API_AXIOS_CONFIG`
- `Endpoints`
- auth-related skip-refresh paths

### Required rules

- Add feature endpoints to `Endpoints`.
- Use helper functions for parameterized paths.
- Keep timeouts and base config centralized.

### API base URL env rule

- `API_BASE_URL` must come from `EXPO_PUBLIC_API_BASE_URL` via `getEnv` in `src/constants/api.ts`. Do not hardcode domains or base URLs in features, screens, or API clients.
- When backend domain/source changes (new project, new environment, or migration), update `EXPO_PUBLIC_API_BASE_URL` in all relevant env files (`.env.test`, `.env.staging`, `.env.production`, and local `.env` variants if used).
- API integration changes are not complete until env values are updated and verified by running app/tests with the target env file.
- Keep endpoint paths in `Endpoints`; only the host/base URL belongs in env.

## RTK Query is the default for server data

Every server-backed feature should start with a `<feature>-api.ts` file.

Examples:

- `src/features/auth/auth-api.ts`
- `src/features/todo/todo-api.ts`

### Use RTK Query for

- fetching lists or details
- create, update, delete operations
- cache invalidation
- optimistic updates
- loading and error state for server interactions

### Do not use slice state for

- list data from the API
- detail records from the API
- server cache copies that RTK Query already manages

## Feature API file standard

Recommended pattern:

```text
src/features/<feature>/<feature>-api.ts
```

Recommended contents:

- `createApi(...)`
- typed request and response contracts
- exported generated hooks
- optional cache patch helpers when the feature needs optimistic behavior

### Required rules

- Use `axiosBaseQuery`.
- Keep endpoint names explicit and readable.
- Export only the generated hooks and API object needed by the feature.
- Prefer one API file per feature unless the feature becomes truly large.

## Slice standard

Use a Redux Toolkit slice only for client-owned app state.

Good slice examples:

- auth session state
- local preferences
- onboarding flags
- UI-level global filters or toggles that are not server cache

Current canonical example:

- `src/features/auth/auth-slice.ts`

### Required rules

- Do not mirror RTK Query cache in a slice.
- Keep selectors next to the slice.
- Keep slice state minimal and serializable.

## Thunk standard

Use `createAsyncThunk` only when you need orchestration.

Good thunk use cases:

- app initialization
- session restore
- persistence to storage
- coordinating multiple actions and endpoints

Canonical example:

- `src/features/auth/auth-thunks.ts`

### Required rules

- Do not write a thunk for simple CRUD that RTK Query can already handle.
- Keep thunks focused on orchestration, not raw transport details.
- If a thunk writes to storage, isolate storage helpers in feature or utility files.

## Auth and persistence standard

The auth flow in this repository is the canonical source of truth.

Reference files:

- `src/features/auth/auth-api.ts`
- `src/features/auth/auth-slice.ts`
- `src/features/auth/auth-thunks.ts`
- `src/features/auth/token-storage.ts`
- `src/utils/storage.ts`
- `src/api/axios-instance.ts`

### Required rules

- Access and refresh token behavior must stay centralized.
- Storage access must go through helper functions, not directly from screens.
- Interceptor-driven refresh must remain in the shared API layer.

## Store usage standard

Use the store shape that already exists:

- root store in `src/store/store.ts`
- typed hooks in `src/store/hooks.ts`
- optional store reference helper in `src/store/store-ref.ts`

### Required rules

- Use `useAppDispatch` and `useAppSelector`.
- Register new RTK Query APIs in the root store.
- Add middleware for every new RTK Query API.
- Avoid importing `useDispatch` and `useSelector` directly in feature code.

## Screen usage rules

### In containers or screen hooks

Allowed:

- RTK Query hooks
- selectors
- dispatch
- navigation side effects
- submit orchestration

### In views

Not allowed:

- API hooks
- direct store access
- raw dispatch logic
- token or storage access

## Cache update guidance

When the user experience benefits from instant feedback, prefer RTK Query cache patching and optimistic updates.

Use `todo-api.ts` as the canonical reference for:

- patching cached list queries
- patching detail queries
- undoing optimistic changes on failure

If a feature is simple, invalidation is acceptable. If a feature is list-heavy and user-facing, optimistic behavior is preferred.

### Server-side paginated / infinite-scroll lists + mutations

A product built on this template that adds server-side pagination to a list (rather than fetching
the full collection unconditionally with `builder.query<T[], void>`) hit real bugs before landing on
the right shape: flashing empty state, duplicated items on infinite scroll, mutated items not
reflecting their new state, deletes silently not working. Read this before wiring up server-side
pagination on any list.

**The mistake:** relying on `invalidatesTags` → automatic RTK Query refetch → a custom `merge`
function to reconcile a mutation (delete/status change) into an already-paginated, multi-page-
accumulated cache. This looks reasonable but is structurally broken for two reasons:

- A mutation's `invalidatesTags` refetch only refreshes **the one page the component currently has
  active** — whether that happens to be the page containing the mutated item is chance, not
  guarantee. Result: updates that work "sometimes" depending on which page you're on.
- A custom `merge` can express "add this item" or "replace this item," but has no way to express
  "this item is gone" — a deleted row simply has no entry in the next page's response, so merge
  never learns to remove it. It lingers in the cache forever. This is not a bug to patch, it's a
  structural gap in the approach.

**The fix, and the rule going forward:** for any mutation that changes an item already visible in a
list (delete, status change, etc.), do **not** depend on refetch+merge for correctness. Use
`onQueryStarted` + `api.util.updateQueryData` to patch the cache directly and optimistically, the
same pattern `todo-api.ts` already uses for `deleteTodo`/`updateTodo` — the FE already knows exactly
what changed (which id, what new value), so write that directly into every matching cache entry via
`api.util.selectCachedArgsForQuery(getState(), '<queryName>')`, with `patch.undo()` rollback on
failure. Keep `invalidatesTags` too, but treat it as a background reconciliation safety net, not the
mechanism the feature's correctness depends on.

Canonical references once pagination is involved:

- `src/api/paginated-endpoint-config.ts` + `src/hooks/use-server-list-paging.ts` /
  `use-server-list-state.ts` — shared server-side pagination + infinite-scroll plumbing. Spread
  `paginatedEndpointConfig<Item, Arg>()` into a `builder.query` endpoint definition
  (`serializeQueryArgs`/`merge`/`forceRefetch`) to get one cache entry per filter set (not per page),
  with desktop pages replacing and mobile pages appending/reconciling by `id`.
- `src/hooks/use-server-list-confirmed-action.ts` — shared confirm-then-act pattern for a row mutation
  (approve/cancel/delete) that toasts the result.
- `todo-api.ts` — the `onQueryStarted` cache-patch pattern to apply on top of a paginated list.

## Quick review checklist

- Does the feature use RTK Query for server data by default?
- Is Redux slice used only for client-owned app state?
- Are thunks reserved for orchestration and persistence flows?
- Is the shared API client reused instead of duplicated?
- Are screens accessing server state only through containers or screen hooks?

## Related references

- Read `.docs/default-behavior-rules.md` for fallback behavior when API/loading/error/success details are not fully specified in the prompt or design.
- Read `.docs/prompt-template-feature.md` or `.docs/prompt-template-full-app.md` when preparing implementation prompts for new work.
