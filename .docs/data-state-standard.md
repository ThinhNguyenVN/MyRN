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

## Quick review checklist

- Does the feature use RTK Query for server data by default?
- Is Redux slice used only for client-owned app state?
- Are thunks reserved for orchestration and persistence flows?
- Is the shared API client reused instead of duplicated?
- Are screens accessing server state only through containers or screen hooks?
